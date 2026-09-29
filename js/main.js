/* ============================================================
   거상 창업내비 — 메인 페이지 스크립트
   7단계 카드를 data/stages.js 내용으로 만들어 넣습니다.
   카드를 누르면 stage-0.html ~ stage-6.html 로 이동합니다.
   ============================================================ */

(function () {
  "use strict";

  var holder = document.getElementById("stage-cards");
  if (!holder) return;

  var DATA = window.STAGE_DATA;
  var stages = DATA && DATA.stages ? DATA.stages : [];

  if (!stages.length) {
    holder.innerHTML = '<li class="notice">단계 내용을 불러오지 못했습니다. data/stages.js 파일을 확인해 주십시오.</li>';
    return;
  }

  function esc(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  holder.innerHTML = stages
    .map(function (s) {
      return (
        "<li>" +
        '<a class="stage-card" href="stage-' + s.no + '.html">' +
        '<span class="stage-card__no">' + s.no + "단계</span>" +
        '<span class="stage-card__name">' + esc(s.name) + "</span>" +
        '<span class="stage-card__period">' + esc(s.period) + "</span>" +
        '<span class="stage-card__summary">' + esc(s.summary) + "</span>" +
        '<span class="stage-card__go">자세히 보기 →</span>' +
        "</a>" +
        "</li>"
      );
    })
    .join("");
})();
