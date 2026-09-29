/* ============================================================
   거상 창업내비 — 지원사업 찾기 (support.html)
   data/support.js 내용을 카드 목록으로 만들고,
   단계 · 분야 · 연령 · 39세 이후 대안 · 정렬 기능을 담당합니다.
   ============================================================ */

(function () {
  "use strict";

  var listEl = document.getElementById("support-list");
  if (!listEl) return;

  var DATA = window.SUPPORT_DATA;
  var items = DATA && DATA.items ? DATA.items : [];

  var countEl = document.getElementById("support-count");
  var selStage = document.getElementById("f-stage");
  var selField = document.getElementById("f-field");
  var selAge = document.getElementById("f-age");
  var selSort = document.getElementById("f-sort");
  var togAlt = document.getElementById("f-alt");
  var resetBtn = document.getElementById("f-reset");

  if (!items.length) {
    listEl.innerHTML = '<li class="notice">지원사업 목록을 불러오지 못했습니다. data/support.js 파일을 확인해 주십시오.</li>';
    return;
  }

  function esc(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* 카드마다 표시할 기준 연도 (data/support.js 에서 바꾸실 수 있습니다) */
  var BASIS_YEAR = DATA.basisYear || "2026";

  var AGE_LABEL = {
    youth39: "만 39세 이하 전용",
    over40: "40세 이상 가능",
    any: "연령 무관"
  };

  /* --- 마감일 표시 --- */
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  function deadlineInfo(item) {
    if (!item.deadline) {
      return { text: "공고 시기 [확인 후 입력]", cls: "is-unknown", sortValue: 1000000 };
    }
    var d = new Date(item.deadline + "T00:00:00");
    if (isNaN(d.getTime())) {
      return { text: "공고 시기 [확인 후 입력]", cls: "is-unknown", sortValue: 1000000 };
    }
    var days = Math.round((d - today) / 86400000);
    var shown = item.deadline.replace(/-/g, ".");

    if (days < 0) return { text: shown + " 마감되었습니다", cls: "is-closed", sortValue: 900000 };
    if (days === 0) return { text: shown + " 오늘 마감", cls: "is-soon", sortValue: days };
    if (days <= 14) return { text: shown + " 마감 (" + days + "일 남음)", cls: "is-soon", sortValue: days };
    return { text: shown + " 마감 (" + days + "일 남음)", cls: "", sortValue: days };
  }

  /* --- 걸러내기 --- */
  function filtered() {
    var stage = selStage.value;
    var field = selField.value;
    var age = selAge.value;
    var altOnly = togAlt.checked;

    return items.filter(function (it) {
      if (stage !== "all" && (it.stages || []).indexOf(Number(stage)) === -1) return false;
      if (field !== "all" && it.field !== field) return false;

      if (age === "youth39" && it.age !== "youth39") return false;
      if (age === "over40" && !(it.age === "over40" || it.age === "any")) return false;
      if (age === "any" && it.age !== "any") return false;

      /* 39세 이후 대안 : 청년 전용 사업을 숨깁니다 */
      if (altOnly && it.age === "youth39") return false;

      return true;
    });
  }

  /* --- 순서 정하기 --- */
  function sorted(list) {
    var arr = list.slice();
    if (selSort.value === "name") {
      arr.sort(function (a, b) {
        return a.name.localeCompare(b.name, "ko");
      });
    } else {
      arr.sort(function (a, b) {
        var da = deadlineInfo(a).sortValue;
        var db = deadlineInfo(b).sortValue;
        if (da !== db) return da - db;
        return a.name.localeCompare(b.name, "ko");
      });
    }
    return arr;
  }

  /* --- 카드 한 장 --- */
  function card(it) {
    var dl = deadlineInfo(it);
    var stages = (it.stages || [])
      .map(function (n) {
        return '<a class="sp-card__stage" href="stage-' + n + '.html">' + n + "단계</a>";
      })
      .join("");

    var linkBtn = it.url
      ? '<a class="sp-card__link" href="' + esc(it.url) + '" target="_blank" rel="noopener">원문 공고 보기 →</a>'
      : '<span class="sp-card__link is-off" aria-disabled="true" title="원문 공고 주소가 아직 등록되지 않았습니다">원문 공고 보기</span>';

    return (
      '<li class="sp-card">' +
      '<div class="sp-card__top">' +
      '<span class="sp-card__age sp-card__age--' + it.age + '">' + AGE_LABEL[it.age] + "</span>" +
      '<span class="sp-card__field">' + esc(it.field) + "</span>" +
      "</div>" +
      '<h3 class="sp-card__name">' + esc(it.name) + "</h3>" +
      (it.org ? '<p class="sp-card__org">' + esc(it.org) + "</p>" : "") +
      '<p class="sp-card__summary">' + esc(it.summary) + "</p>" +
      '<div class="sp-card__stages">' + stages + "</div>" +
      '<p class="sp-card__deadline ' + dl.cls + '">' + dl.text + "</p>" +
      '<div class="sp-card__foot">' +
      '<span class="sp-card__asof">' +
      (it.asOf ? "기준일 " + esc(it.asOf.replace(/-/g, ".")) : BASIS_YEAR + "년 공고 기준") +
      "</span>" +
      linkBtn +
      "</div>" +
      "</li>"
    );
  }

  /* --- 화면 다시 그리기 --- */
  function render() {
    var list = sorted(filtered());

    countEl.textContent =
      "전체 " + items.length + "개 가운데 " + list.length + "개가 조건에 맞습니다.";

    if (!list.length) {
      listEl.innerHTML =
        '<li class="sp-empty">조건에 맞는 지원사업이 없습니다. 조건을 넓혀 보시거나 "조건 초기화"를 눌러 주십시오.</li>';
      return;
    }

    listEl.innerHTML = list.map(card).join("");
  }

  /* --- 분야 선택 칸 채우기 --- */
  (DATA.fields || []).forEach(function (f) {
    var opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    selField.appendChild(opt);
  });

  [selStage, selField, selAge, selSort].forEach(function (el) {
    el.addEventListener("change", render);
  });

  togAlt.addEventListener("change", function () {
    /* 39세 이후 대안을 켜면 연령 조건이 겹치지 않도록 정리합니다 */
    if (togAlt.checked && selAge.value === "youth39") selAge.value = "all";
    render();
  });

  resetBtn.addEventListener("click", function () {
    selStage.value = "all";
    selField.value = "all";
    selAge.value = "all";
    selSort.value = "deadline";
    togAlt.checked = false;
    render();
  });

  /* --- 다른 페이지에서 단계를 지정해 들어온 경우 (support.html?stage=3) --- */
  var m = window.location.search.match(/[?&]stage=([0-6])/);
  if (m) selStage.value = m[1];

  render();
})();
