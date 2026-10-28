import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { buildDashboardPipeline, formatDashboardResult } from "../src/aggregations/dashboardAggregations.js";
import { buildMonthlyTrendsPipeline, buildPaymentAndTagPipeline } from "../src/aggregations/analyticsAggregations.js";
import { buildBudgetTrackingPipeline } from "../src/aggregations/budgetAggregations.js";
import { buildMaterializeSummaryPipeline } from "../src/aggregations/summaryAggregations.js";

describe("Phase 4 Database Reporting & Aggregations", () => {
  const mockUserId = new mongoose.Types.ObjectId();

  it("buildDashboardPipeline constructs valid $facet pipeline with 5 facets", () => {
    const pipeline = buildDashboardPipeline(mockUserId);
    assert.equal(pipeline[0].$match.userId.toString(), mockUserId.toString());
    assert.ok(pipeline[1].$facet, "Pipeline should have $facet stage");

    const facets = Object.keys(pipeline[1].$facet);
    assert.ok(facets.includes("lifetimeTotals"), "Contains lifetimeTotals facet");
    assert.ok(facets.includes("periodTotals"), "Contains periodTotals facet");
    assert.ok(facets.includes("categorySpending"), "Contains categorySpending facet");
    assert.ok(facets.includes("dailyTrends"), "Contains dailyTrends facet");
    assert.ok(facets.includes("recentTransactions"), "Contains recentTransactions facet");
  });

  it("formatDashboardResult correctly calculates net balance and percentages", () => {
    const mockFacetOutput = [
      {
        lifetimeTotals: [
          { _id: "income", totalAmount: 10000 },
          { _id: "expense", totalAmount: 4000 },
        ],
        periodTotals: [
          { _id: "income", totalAmount: 5000 },
          { _id: "expense", totalAmount: 2000 },
        ],
        categorySpending: [
          { _id: new mongoose.Types.ObjectId(), totalAmount: 1000, categoryName: "Groceries" },
          { _id: new mongoose.Types.ObjectId(), totalAmount: 1000, categoryName: "Rent" },
        ],
        dailyTrends: [],
        recentTransactions: [],
      },
    ];

    const formatted = formatDashboardResult(mockFacetOutput);
    assert.equal(formatted.lifetime.totalIncome, 10000);
    assert.equal(formatted.lifetime.totalExpense, 4000);
    assert.equal(formatted.lifetime.balance, 6000);
    assert.equal(formatted.period.savingsRate, 60); // (5000-2000)/5000 = 60%
    assert.equal(formatted.categorySpending[0].percentage, 50); // 1000/2000 = 50%
  });

  it("buildMonthlyTrendsPipeline defines $setWindowFields for rolling average", () => {
    const pipeline = buildMonthlyTrendsPipeline(mockUserId, 6);
    const windowStage = pipeline.find((stage) => stage.$setWindowFields);
    assert.ok(windowStage, "Pipeline must contain $setWindowFields stage");
    assert.ok(windowStage.$setWindowFields.output.movingAvgExpense, "Computes movingAvgExpense");
    assert.ok(windowStage.$setWindowFields.output.cumulativeSavings, "Computes cumulativeSavings");
  });

  it("buildBudgetTrackingPipeline calculates alert status and remaining", () => {
    const pipeline = buildBudgetTrackingPipeline(mockUserId);
    assert.equal(pipeline[0].$match.userId.toString(), mockUserId.toString());
    const projectStage = pipeline.find((stage) => stage.$project?.alertStatus);
    assert.ok(projectStage, "Budget tracking must compute alertStatus");
  });

  it("buildMaterializeSummaryPipeline contains $merge into monthly_summaries", () => {
    const pipeline = buildMaterializeSummaryPipeline(mockUserId);
    const mergeStage = pipeline.find((stage) => stage.$merge);
    assert.ok(mergeStage, "Pipeline must contain $merge stage");
    assert.equal(mergeStage.$merge.into, "monthly_summaries");
    assert.equal(mergeStage.$merge.whenMatched, "replace");
  });
});
