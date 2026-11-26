import test from "node:test";
import assert from "node:assert/strict";
import { cleanHtml } from "../src/lib/sanitize.js";

test("authored HTML tables retain semantic structure and safe formatting", () => {
  const source = '<table style="width:100%;border-collapse:collapse"><colgroup><col style="width:120px"></colgroup><thead><tr><th scope="col">Course</th><th scope="col">Learning objective</th></tr></thead><tbody><tr><td style="text-align:center;vertical-align:middle;width:120px"><strong>Noorani Qaida</strong></td><td>Arabic letters and foundational reading</td></tr></tbody></table>';
  const html = cleanHtml(source);

  assert.match(html, /class="article-table-scroll" role="region" aria-label="Scrollable table 1" tabindex="0"/);
  assert.match(html, /<thead><tr><th scope="col">Course<\/th><th scope="col">Learning objective<\/th><\/tr><\/thead>/);
  assert.match(html, /<tbody><tr><td[^>]*><strong>Noorani Qaida<\/strong><\/td><td>Arabic letters and foundational reading<\/td><\/tr><\/tbody>/);
  assert.match(html, /<colgroup><col style="width:120px"\s*\/?>\s*<\/colgroup>/);
  assert.match(html, /text-align:center/);
  assert.match(html, /vertical-align:middle/);
});

test("unsafe table styles are removed while safe cell alignment remains", () => {
  const html = cleanHtml('<table><tr><td style="text-align:center;position:fixed;background-image:url(javascript:alert(1))">Safe text</td></tr></table>');
  assert.match(html, /text-align:center/);
  assert.doesNotMatch(html, /position:fixed|background-image|javascript:/i);
});

test("legacy two-column paragraph tables are restored as real tables", () => {
  const source = [
    "<p><strong>Course</strong></p>",
    "<p><strong>Learning Objective</strong></p>",
    "<p>Noorani Qaida</p>",
    "<p>Arabic letters and foundational reading</p>",
    "<p>Quran Nazara</p>",
    "<p>Quran reading fluency</p>",
    "<p>Quran with Tajweed</p>",
    "<p>Correct pronunciation and recitation</p>",
    "<p>Quran Hifz</p>",
    "<p>Memorization and revision</p>",
    "<p><strong>Noorani Qaida:</strong> Beginners can learn letters and pronunciation.</p>"
  ].join("");

  const html = cleanHtml(source);
  assert.match(html, /<th scope="col">Course<\/th>/);
  assert.match(html, /<th scope="col">Learning Objective<\/th>/);
  assert.equal((html.match(/<tr>/g) || []).length, 5);
  assert.match(html, /<td>Noorani Qaida<\/td><td>Arabic letters and foundational reading<\/td>/);
  assert.match(html, /<strong>Noorani Qaida:<\/strong>/);
  assert.equal((html.match(/class="article-table-scroll"/g) || []).length, 1);
});

test("legacy time-zone table stops before the explanatory paragraph", () => {
  const source = [
    "<p><strong>Time Zone</strong></p>",
    "<p><strong>UTC Offset</strong></p>",
    "<p>Dallas CST</p>",
    "<p>UTC-6</p>",
    "<p>Dallas CDT</p>",
    "<p>UTC-5</p>",
    "<p>Pakistan PKT</p>",
    "<p>UTC+5</p>",
    "<p>Dallas is 11 hours behind Pakistan during CST and 10 hours behind during CDT.</p>"
  ].join("");

  const html = cleanHtml(source);
  assert.equal((html.match(/<tr>/g) || []).length, 4);
  assert.match(html, /<td>Pakistan PKT<\/td><td>UTC\+5<\/td>/);
  assert.match(html, /Dallas is 11 hours behind Pakistan/);
});

test("ordinary paragraphs and incomplete bold-label sequences are not converted", () => {
  const source = "<p><strong>Course</strong></p><p><strong>Learning Objective</strong></p><p>Noorani Qaida</p><p>Foundational reading</p>";
  const html = cleanHtml(source);
  assert.doesNotMatch(html, /<table|article-table-scroll/);
});
