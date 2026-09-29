/* ============================================================
   거상창업가이드 — 페르소나 시나리오 페이지 공통 스크립트
   scenario-youth.html / scenario-senior.html 두 페이지가 함께 씁니다.

   세로 타임라인(0~6단계)을 data/stages.js 내용으로 만듭니다.
   - 청년 페이지: 청년용 지원사업을 표시합니다.
   - 중장년 페이지: 40세 이상용 지원사업을 표시하고,
     해야 할 일을 체크리스트로 보여 줍니다.
   ============================================================ */

(function () {
  "use strict";

  var holder = document.getElementById("scenario-timeline");
  if (!holder) return;

  var persona = document.body.getAttribute("data-persona"); // "youth" 또는 "senior"
  var asChecklist = document.body.getAttribute("data-checklist") === "on";

  var DATA = window.STAGE_DATA;
  var stages = DATA && DATA.stages ? DATA.stages : [];

  if (!stages.length) {
    holder.innerHTML = '<p class="notice">단계 내용을 불러오지 못했습니다. data/stages.js 파일을 확인해 주십시오.</p>';
    return;
  }

  function esc(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* --- 체크 상태 저장 (단계 페이지와 같은 칸을 씁니다) --- */
  function storeKey(no) {
    return "geosang-guide:stage-" + no + ":todos";
  }

  function loadChecked(no) {
    try {
      var raw = window.localStorage.getItem(storeKey(no));
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveChecked(no, list) {
    try {
      window.localStorage.setItem(storeKey(no), JSON.stringify(list));
    } catch (e) {
      /* 저장만 실패하고 화면은 그대로 씁니다. */
    }
  }

  /* --- 이 페르소나에게 해당되는 지원사업 골라내기 --- */
  function pickSupport(stage) {
    var sup = stage.support || {};
    if (sup.common && sup.common.length) {
      return { label: "청년 · 40세 이상 공통", list: sup.common };
    }
    if (persona === "senior") {
      return { label: "40세 이상", list: sup.senior || [] };
    }
    return { label: "청년 (만 39세 이하)", list: sup.youth || [] };
  }

  /* --- 해야 할 일 부분 --- */
  function todoBlock(stage) {
    var todos = stage.todos || [];
    if (!todos.length) return "";

    if (!asChecklist) {
      return (
        '<ul class="tl-todos">' +
        todos
          .map(function (t) {
            return "<li>" + esc(t) + "</li>";
          })
          .join("") +
        "</ul>"
      );
    }

    var checked = loadChecked(stage.no);
    return (
      '<p class="tl-todos__title">해야 할 일</p>' +
      '<ul class="tl-checks" data-stage-no="' + stage.no + '">' +
      todos
        .map(function (t, i) {
          var isOn = checked.indexOf(i) !== -1;
          return (
            '<li class="tl-check' + (isOn ? " is-done" : "") + '">' +
            "<label>" +
            '<input type="checkbox" data-index="' + i + '"' + (isOn ? " checked" : "") + " />" +
            "<span>" + esc(t) + "</span>" +
            "</label>" +
            "</li>"
          );
        })
        .join("") +
      "</ul>"
    );
  }

  /* --- 지원사업 부분 --- */
  function supportBlock(stage) {
    var picked = pickSupport(stage);

    if (!picked.list.length) {
      return (
        '<div class="tl-support">' +
        '<p class="tl-support__title">' + esc(picked.label) + " 지원사업</p>" +
        '<p class="tl-support__empty">해당 내용은 [확인 후 추가]</p>' +
        "</div>"
      );
    }

    return (
      '<div class="tl-support">' +
      '<p class="tl-support__title">' + esc(picked.label) + " 지원사업</p>" +
      '<ul class="tl-support__list">' +
      picked.list
        .map(function (item) {
          return (
            "<li>" +
            '<span class="tl-support__name">' + esc(item.name) + "</span>" +
            (item.desc ? '<span class="tl-support__desc">' + esc(item.desc) + "</span>" : "") +
            "</li>"
          );
        })
        .join("") +
      "</ul>" +
      "</div>"
    );
  }

  /* --- 타임라인 그리기 --- */
  holder.innerHTML =
    '<ol class="timeline">' +
    stages
      .map(function (s) {
        return (
          '<li class="tl-item">' +
          '<div class="tl-mark"><span class="tl-no">' + s.no + "</span></div>" +
          '<div class="tl-body">' +
          '<p class="tl-period">' + esc(s.period) + "</p>" +
          '<h3 class="tl-name"><a href="stage-' + s.no + '.html">' + s.no + "단계 " + esc(s.name) + "</a></h3>" +
          '<p class="tl-summary">' + esc(s.summary) + "</p>" +
          todoBlock(s) +
          supportBlock(s) +
          '<p class="tl-go"><a href="stage-' + s.no + '.html">' + s.no + "단계 자세히 보기 →</a></p>" +
          "</div>" +
          "</li>"
        );
      })
      .join("") +
    "</ol>";

  /* --- 체크리스트 동작 (중장년 페이지) --- */
  if (asChecklist) {
    holder.addEventListener("change", function (e) {
      var box = e.target;
      if (!box || box.type !== "checkbox") return;

      var listEl = box.closest(".tl-checks");
      if (!listEl) return;

      var no = Number(listEl.getAttribute("data-stage-no"));
      var i = Number(box.getAttribute("data-index"));
      var checked = loadChecked(no);
      var pos = checked.indexOf(i);

      if (box.checked && pos === -1) checked.push(i);
      if (!box.checked && pos !== -1) checked.splice(pos, 1);

      box.closest(".tl-check").classList.toggle("is-done", box.checked);
      saveChecked(no, checked);
    });
  }
})();
