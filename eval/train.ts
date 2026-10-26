import { writeFileSync } from "node:fs";
import { generate } from "./simulator.js";
import { train } from "../src/diagnosis/classifier.js";

const model = train(generate(20000, 1337));
writeFileSync(new URL("../models/naive-bayes.json", import.meta.url), JSON.stringify(model));
console.log(`trained on ${model.trainedOn} simulated cases`);
