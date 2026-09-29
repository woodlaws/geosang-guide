/* ============================================================
   거상 창업내비 — 단계 상세 페이지 공통 스크립트
   stage-0.html ~ stage-6.html 7개 페이지가 이 파일 하나를 씁니다.
   내용은 data/stages.js 에서 가져옵니다.
   ============================================================ */

(function () {
  "use strict";

  var DATA = window.STAGE_DATA;
  var stages = DATA && DATA.stages ? DATA.stages : [];
  var current = Number(document.body.getAttribute("data-stage"));
  var stage = stages[current];

  var root = document.getElementById("stage-app");
  if (!stage || !root) {
    if (root) {
      root.innerHTML =
        '<div class="wrap"><p class="notice">단계 내용을 불러오지 못했습니다. data/stages.js 파일을 확인해 주십시오.</p></div>';
    }
    return;
  }

  /* --- 글자를 그대로 화면에 넣기 위한 처리 --- */
  function esc(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* --- 체크 상태를 이 브라우저에 저장 / 불러오기 --- */
  var STORE_KEY = "geosang-navi:stage-" + current + ":todos";

  function loadChecked() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return []; // 시크릿 모드 등에서 저장이 막혀 있어도 페이지는 정상 동작합니다.
    }
  }

  function saveChecked(list) {
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(list));
    } catch (e) {
      /* 저장만 실패하고 화면은 그대로 씁니다. */
    }
  }

  var checked = loadChecked();

  /* ============================================================
     1. 페이지 상단 (단계 번호 · 단계명 · 시기 · 한 줄 요약)
     ============================================================ */
  function renderHead() {
    return (
      '<section class="stage-head">' +
      '<div class="wrap">' +
      '<p class="stage-head__crumb"><a href="index.html">홈</a> <span>·</span> 창업 7단계</p>' +
      '<p class="stage-head__no">' + current + '단계</p>' +
      '<h1 class="stage-head__name">' + esc(stage.name) + '</h1>' +
      '<p class="stage-head__period">' + esc(stage.period) + '</p>' +
      '<p class="stage-head__summary">' + esc(stage.summary) + '</p>' +
      '</div>' +
      '</section>'
    );
  }

  /* ============================================================
     2. 7단계 진행 표시 바 + 이전 / 다음 단계 이동
     ============================================================ */
  function renderProgress() {
    var steps = stages
      .map(function (s) {
        var cls = "stepbar__item";
        if (s.no === current) cls += " is-current";
        else if (s.no < current) cls += " is-done";
        return (
          '<a class="' + cls + '" href="stage-' + s.no + '.html" aria-current="' +
          (s.no === current ? "page" : "false") + '">' +
          '<span class="stepbar__no">' + s.no + '</span>' +
          '<span class="stepbar__label">' + esc(s.name) + '</span>' +
          "</a>"
        );
      })
      .join("");

    var prev = stages[current - 1];
    var next = stages[current + 1];

    var prevHtml = prev
      ? '<a class="pager__btn" href="stage-' + prev.no + '.html">' +
        '<span class="pager__dir">← 이전 단계</span>' +
        '<span class="pager__name">' + prev.no + ". " + esc(prev.name) + "</span></a>"
      : '<span class="pager__btn is-off"><span class="pager__dir">← 이전 단계</span>' +
        '<span class="pager__name">첫 단계입니다</span></span>';

    var nextHtml = next
      ? '<a class="pager__btn pager__btn--next" href="stage-' + next.no + '.html">' +
        '<span class="pager__dir">다음 단계 →</span>' +
        '<span class="pager__name">' + next.no + ". " + esc(next.name) + "</span></a>"
      : '<span class="pager__btn pager__btn--next is-off"><span class="pager__dir">다음 단계 →</span>' +
        '<span class="pager__name">마지막 단계입니다</span></span>';

    return (
      '<section class="stepbar-section">' +
      '<div class="wrap">' +
      '<nav class="stepbar" aria-label="창업 7단계 진행 표시">' + steps + "</nav>" +
      '<div class="pager">' + prevHtml + nextHtml + "</div>" +
      "</div>" +
      "</section>"
    );
  }

  /* ============================================================
     3. 섹션 ① 해야 할 일 (체크 상태는 브라우저에 저장됩니다)
     ============================================================ */
  function renderTodos() {
    var items = (stage.todos || [])
      .map(function (todo, i) {
        var isOn = checked.indexOf(i) !== -1;
        return (
          '<li class="todo' + (isOn ? " is-done" : "") + '">' +
          '<label class="todo__label">' +
          '<input type="checkbox" class="todo__box" data-index="' + i + '"' + (isOn ? " checked" : "") + " />" +
          '<span class="todo__text">' + esc(todo) + "</span>" +
          "</label>" +
          "</li>"
        );
      })
      .join("");

    return (
      '<section class="sec" id="todo">' +
      '<div class="wrap">' +
      '<div class="sec__head">' +
      '<span class="sec__num">①</span>' +
      "<h2>해야 할 일</h2>" +
      '<p class="sec__desc">체크한 내용은 이 브라우저에 저장됩니다. 다시 방문하셔도 그대로 남아 있습니다.</p>' +
      "</div>" +
      '<p class="todo-count" id="todo-count"></p>' +
      '<ul class="todo-list" id="todo-list">' + items + "</ul>" +
      '<button type="button" class="btn-reset" id="todo-reset">체크 모두 지우기</button>' +
      "</div>" +
      "</section>"
    );
  }

  /* ============================================================
     4. 섹션 ② 필요 서류 · 문서양식
     ============================================================ */
  function renderDocs() {
    var items = (stage.docs || [])
      .map(function (doc) {
        return (
          '<li class="doc">' +
          '<a class="doc__link" href="library.html#' + esc(doc.slug) + '">' +
          '<span class="doc__name">' + esc(doc.name) + "</span>" +
          (doc.note ? '<span class="doc__note">' + esc(doc.note) + "</span>" : "") +
          '<span class="doc__go">자료실에서 보기</span>' +
          "</a>" +
          "</li>"
        );
      })
      .join("");

    return (
      '<section class="sec sec--tint" id="docs">' +
      '<div class="wrap">' +
      '<div class="sec__head">' +
      '<span class="sec__num">②</span>' +
      "<h2>필요 서류 · 문서양식</h2>" +
      '<p class="sec__desc">양식은 자료실에서 내려받으실 수 있습니다.</p>' +
      "</div>" +
      '<ul class="doc-list">' + items + "</ul>" +
      "</div>" +
      "</section>"
    );
  }

  /* ============================================================
     5. 섹션 ③ 이 단계 지원사업 (청년 / 40세 이상)
     ============================================================ */
  function supportCards(list) {
    if (!list || !list.length) {
      return '<p class="support__empty">해당 내용은 [확인 후 추가]</p>';
    }
    return (
      '<ul class="support-list">' +
      list
        .map(function (item) {
          return (
            '<li class="support-item">' +
            '<p class="support-item__name">' + esc(item.name) + "</p>" +
            (item.desc ? '<p class="support-item__desc">' + esc(item.desc) + "</p>" : "") +
            "</li>"
          );
        })
        .join("") +
      "</ul>"
    );
  }

  function renderSupport() {
    var sup = stage.support || {};
    var body;

    if (sup.common && sup.common.length) {
      body =
        '<div class="support-box support-box--common">' +
        '<p class="support-box__title">청년 · 40세 이상 공통</p>' +
        supportCards(sup.common) +
        "</div>";
    } else {
      body =
        '<div class="support-cols">' +
        '<div class="support-box">' +
        '<p class="support-box__title">청년 (만 39세 이하)</p>' +
        supportCards(sup.youth) +
        "</div>" +
        '<div class="support-box">' +
        '<p class="support-box__title">40세 이상</p>' +
        supportCards(sup.senior) +
        "</div>" +
        "</div>";
    }

    return (
      '<section class="sec" id="support">' +
      '<div class="wrap">' +
      '<div class="sec__head">' +
      '<span class="sec__num">③</span>' +
      "<h2>이 단계 지원사업</h2>" +
      (sup.note ? '<p class="sec__desc">' + esc(sup.note) + "</p>" : "") +
      "</div>" +
      body +
      '<p class="support__caution">공고 시기와 지원 요건은 해마다 바뀝니다. 신청 전에 해당 기관 공고를 반드시 확인해 주십시오.</p>' +
      '<p class="support__more"><a href="support.html">지원사업 전체 보기 →</a></p>' +
      "</div>" +
      "</section>"
    );
  }

  /* ============================================================
     6. 하단 상담 신청
     ============================================================ */
  function renderCta() {
    return (
      '<section class="cta">' +
      '<div class="wrap">' +
      "<h2>이 단계에서 막히셨나요?</h2>" +
      "<p>" + current + "단계 " + esc(stage.name) + "에 관한 내용을 상담해 드립니다.</p>" +
      '<a class="btn-cta" href="contact.html?stage=' + current + '">무료 상담 신청</a>' +
      "</div>" +
      "</section>"
    );
  }

  /* ============================================================
     화면에 그리기
     ============================================================ */
  root.innerHTML =
    renderHead() + renderProgress() + renderTodos() + renderDocs() + renderSupport() + renderCta();

  document.title = current + "단계 " + stage.name + " · 거상 창업내비";

  /* ============================================================
     체크박스 동작
     ============================================================ */
  var list = document.getElementById("todo-list");
  var countEl = document.getElementById("todo-count");
  var resetBtn = document.getElementById("todo-reset");

  function updateCount() {
    var total = (stage.todos || []).length;
    countEl.textContent = "완료 " + checked.length + " / " + total + "개";
    countEl.className = "todo-count" + (total > 0 && checked.length === total ? " is-all" : "");
  }

  list.addEventListener("change", function (e) {
    var box = e.target;
    if (!box.classList || !box.classList.contains("todo__box")) return;

    var i = Number(box.getAttribute("data-index"));
    var pos = checked.indexOf(i);

    if (box.checked && pos === -1) checked.push(i);
    if (!box.checked && pos !== -1) checked.splice(pos, 1);

    box.closest(".todo").classList.toggle("is-done", box.checked);
    saveChecked(checked);
    updateCount();
  });

  resetBtn.addEventListener("click", function () {
    checked = [];
    saveChecked(checked);
    Array.prototype.forEach.call(list.querySelectorAll(".todo__box"), function (box) {
      box.checked = false;
      box.closest(".todo").classList.remove("is-done");
    });
    updateCount();
  });

  updateCount();
})();
