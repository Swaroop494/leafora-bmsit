import { describe, expect, it } from "vitest";
import { category, estimateCarbon, scoreHealth } from "./trees";

describe("tree rules", () => {
  it("uses the four health bands from the deck", () => {
    expect(category(80)).toBe("Healthy");
    expect(category(74)).toBe("Watch");
    expect(category(45)).toBe("Stressed");
    expect(category(39)).toBe("Critical");
  });
  it("carbon is 47% of dry biomass and CO2 is carbon x 3.67", () => {
    const r = estimateCarbon(168, 11, 0.69);
    expect(r.carbonKg).toBeCloseTo(r.biomassKg * 0.47);
    expect(r.co2Kg).toBeCloseTo(r.carbonKg * 3.67);
  });
  it("a tree with no symptoms scores 100", () => {
    expect(scoreHealth([]).score).toBe(100);
  });
});
