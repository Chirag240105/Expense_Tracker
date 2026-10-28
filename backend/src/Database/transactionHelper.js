import mongoose from "mongoose";

/**
 * Runs a callback inside a MongoDB multi-document ACID transaction.
 * Detects whether the current MongoDB deployment supports transactions (replica set or mongos).
 * On standalone MongoDB or offline states, executes the operations with a fallback to ensure local compatibility.
 */
export async function withTransaction(callback) {
  let session = null;
  let supportsTransactions = false;

  // If disconnected or buffering, execute without session
  if (mongoose.connection.readyState !== 1) {
    return callback(null);
  }

  try {
    session = await mongoose.startSession();
    const isMaster = await mongoose.connection.db.admin().command({ isMaster: 1 });
    supportsTransactions = Boolean(isMaster.setName || isMaster.msg === "isdbgrid");

    if (supportsTransactions) {
      session.startTransaction({
        readConcern: { level: "snapshot" },
        writeConcern: { w: "majority" },
      });
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } else {
      // Standalone fallback: execute directly
      return await callback(null);
    }
  } catch (err) {
    if (session && supportsTransactions && session.inTransaction()) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

export default withTransaction;
