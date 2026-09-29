/* ============================================================
   거상 창업내비 — 3분 창업 진단 (check.html)

   한 화면에 한 문항씩 보여 주고, 마지막에 결과 카드를 만듭니다.
   문항 내용 : data/check.js
   단계 내용 : data/stages.js
   지원사업   : data/support.js

   ※ 입력하신 답은 어디에도 저장되지 않습니다.
     결과 화면을 만드는 데에만 쓰이고, 창을 닫으면 사라집니다.
   ============================================================ */

(function () {
  "use strict";

  var quizEl = document.getElementById("quiz");
  if (!quizEl) return;

  var CHECK = window.CHECK_DATA || {};
  var QUESTIONS = CHECK.questions || [];
  var STAGES = (window.STAGE_DATA && window.STAGE_DATA.stages) || [];
  var SUPPORT = (window.SUPPORT_DATA && window.SUPPORT_DATA.items) || [];

  var resultEl = document.getElementById("result");
  var barEl = document.getElementById("quiz-bar");
  var stepText = document.getElementById("quiz-step");

  if (!QUESTIONS.length || !STAGES.length) {
    quizEl.innerHTML = '<p class="notice">진단 문항을 불러오지 못했습니다. data 폴더의 파일을 확인해 주십시오.</p>';
    return;
  }

  function esc(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var answers = {};
  var lastResultText = ""; /* 저장할 때 함께 남길 진단 결과 (예 : "3단계 생존기") */
  var history = []; /* 지나온 문항 번호 (뒤로 가기에 씁니다) */
  var cursor = 0;

  /* --- 이 답으로는 건너뛰어야 하는 문항인지 --- */
  function shouldSkip(q) {
    return typeof q.skipIf === "function" && q.skipIf(answers);
  }

  /* --- 실제로 물어볼 문항 수 (건너뛸 문항 제외) --- */
  function totalCount() {
    return QUESTIONS.filter(function (q) {
      return !shouldSkip(q);
    }).length;
  }

  /* ============================================================
     문항 화면
     ============================================================ */
  function renderQuestion() {
    var q = QUESTIONS[cursor];

    while (q && shouldSkip(q)) {
      cursor += 1;
      q = QUESTIONS[cursor];
    }

    if (!q) {
      renderResult();
      return;
    }

    var done = history.length;
    var total = totalCount();
    var percent = Math.round((done / total) * 100);

    barEl.style.width = percent + "%";
    barEl.parentNode.setAttribute("aria-valuenow", String(percent));
    stepText.textContent = "질문 " + (done + 1) + " / " + total;

    quizEl.innerHTML =
      '<div class="q">' +
      '<h2 class="q__title">' + esc(q.title) + "</h2>" +
      (q.help ? '<p class="q__help">' + esc(q.help) + "</p>" : "") +
      '<ul class="q__opts">' +
      q.options
        .map(function (o) {
          var on = answers[q.id] === o.value;
          return (
            '<li><button type="button" class="q__opt' + (on ? " is-on" : "") + '" data-value="' + esc(o.value) + '">' +
            esc(o.label) +
            "</button></li>"
          );
        })
        .join("") +
      "</ul>" +
      (history.length ? '<button type="button" class="q__back" id="q-back">← 이전 질문</button>' : "") +
      "</div>";

    var backBtn = document.getElementById("q-back");
    if (backBtn) {
      backBtn.addEventListener("click", function () {
        cursor = history.pop();
        renderQuestion();
      });
    }

    quizEl.querySelector(".q__opts").addEventListener("click", function (e) {
      var btn = e.target.closest(".q__opt");
      if (!btn) return;

      answers[q.id] = btn.getAttribute("data-value");
      history.push(cursor);
      cursor += 1;
      renderQuestion();
    });
  }

  /* ============================================================
     결과 판정
     ============================================================ */
  function decide() {
    var stage;

    if (answers.biz === "no") {
      stage = 1;
    } else {
      switch (answers.years) {
        case "pre": stage = 2; break;       /* 등록은 마쳤으나 아직 시작 전 */
        case "under1": stage = 3; break;
        case "1to3": stage = 4; break;
        case "3to7": stage = 5; break;
        case "over7": stage = 5; break;
        default: stage = 2;
      }
    }

    return {
      stage: stage,
      isYouth: answers.age === "under39",
      showBeforeQuit: answers.biz === "no",
      showOver7: answers.years === "over7",
      isFemale: answers.gender === "female",
      isFood: answers.industry === "food"
    };
  }

  /* --- 조건에 맞는 지원사업 3개 고르기 --- */
  function pickSupport(res) {
    var eligible = SUPPORT.filter(function (it) {
      /* 40세 이상은 청년 전용 사업을 신청하실 수 없습니다 */
      if (!res.isYouth && it.age === "youth39") return false;
      return true;
    });

    var picked = [];

    /* 여성이신 경우 여성 대상 사업을 먼저 넣습니다 */
    if (res.isFemale) {
      var names = (CHECK.extras.female && CHECK.extras.female.names) || [];
      names.forEach(function (n) {
        eligible.forEach(function (it) {
          if (it.name === n && picked.indexOf(it) === -1) picked.push(it);
        });
      });
    }

    /* 현재 단계에 해당하는 사업 */
    eligible.forEach(function (it) {
      if (picked.length >= 3) return;
      if ((it.stages || []).indexOf(res.stage) !== -1 && picked.indexOf(it) === -1) picked.push(it);
    });

    /* 그래도 3개가 안 되면 가까운 단계에서 채웁니다 */
    if (picked.length < 3) {
      eligible
        .slice()
        .sort(function (a, b) {
          function dist(it) {
            return Math.min.apply(
              null,
              (it.stages || [9]).map(function (n) {
                return Math.abs(n - res.stage);
              })
            );
          }
          return dist(a) - dist(b);
        })
        .forEach(function (it) {
          if (picked.length >= 3) return;
          if (picked.indexOf(it) === -1) picked.push(it);
        });
    }

    return picked.slice(0, 3);
  }

  /* ============================================================
     결과 화면
     ============================================================ */
  function renderResult() {
    var res = decide();
    var stage = STAGES[res.stage];
    var ex = CHECK.extras || {};

    lastResultText = res.stage + "단계 " + stage.name;

    barEl.style.width = "100%";
    stepText.textContent = "진단 완료";

    /* 7단계 진행 바 */
    var steps = STAGES.map(function (s) {
      var cls = "rbar__item";
      if (s.no === res.stage) cls += " is-current";
      else if (s.no < res.stage) cls += " is-done";
      return '<span class="' + cls + '"><span class="rbar__no">' + s.no + "</span></span>";
    }).join("");

    /* 덧붙는 안내 */
    var extras = "";

    if (res.showBeforeQuit && ex.beforeQuit) {
      extras +=
        '<div class="rx">' +
        '<p class="rx__title">' + esc(ex.beforeQuit.title) + "</p>" +
        '<p class="rx__body">' + esc(ex.beforeQuit.body) + "</p>" +
        '<p class="rx__link"><a href="' + ex.beforeQuit.link + '">' + esc(ex.beforeQuit.linkText) + "</a></p>" +
        "</div>";
    }

    if (res.showOver7 && ex.over7) {
      extras +=
        '<div class="rx">' +
        '<p class="rx__title">' + esc(ex.over7.title) + "</p>" +
        '<p class="rx__body">' + esc(ex.over7.body) + "</p>" +
        '<p class="rx__link"><a href="' + ex.over7.link + '">' + esc(ex.over7.linkText) + "</a></p>" +
        "</div>";
    }

    if (res.isFood && ex.food) {
      extras +=
        '<div class="rx rx--food">' +
        '<p class="rx__title">' + esc(ex.food.title) + "</p>" +
        '<p class="rx__body">' + esc(ex.food.body) + "</p>" +
        '<ul class="rx__checks">' +
        (ex.food.checks || [])
          .map(function (c) {
            return "<li>" + esc(c) + "</li>";
          })
          .join("") +
        "</ul>" +
        '<p class="rx__link"><a href="' + ex.food.link + '">' + esc(ex.food.linkText) + "</a></p>" +
        "</div>";
    }

    if (res.isFemale && ex.female) {
      extras +=
        '<div class="rx">' +
        '<p class="rx__title">' + esc(ex.female.title) + "</p>" +
        '<p class="rx__body">' + esc(ex.female.body) + "</p>" +
        "</div>";
    }

    /* 맞춤 지원사업 3개 */
    var sup = pickSupport(res);
    var supHtml = sup.length
      ? '<ul class="rsup">' +
        sup
          .map(function (it) {
            return (
              "<li>" +
              '<p class="rsup__name">' + esc(it.name) + "</p>" +
              '<p class="rsup__desc">' + esc(it.summary) + "</p>" +
              "</li>"
            );
          })
          .join("") +
        "</ul>"
      : '<p class="rsup__empty">조건에 맞는 사업을 찾지 못했습니다. 상담으로 문의해 주십시오.</p>';

    /* 시나리오 링크 */
    var scenario = res.isYouth
      ? { href: "scenario-youth.html", text: "청년 창업 시나리오 보기 →" }
      : { href: "scenario-senior.html", text: "은퇴 · 경단 창업 시나리오 보기 →" };

    /* 상담 페이지로 넘길 값 */
    var params =
      "from=check&stage=" + res.stage +
      "&age=" + encodeURIComponent(answers.age || "") +
      "&gender=" + encodeURIComponent(answers.gender || "") +
      "&biz=" + encodeURIComponent(answers.biz || "") +
      "&years=" + encodeURIComponent(answers.years || "") +
      "&industry=" + encodeURIComponent(answers.industry || "");

    resultEl.innerHTML =
      '<div class="result-card" id="result-card">' +
      '<p class="result-card__tag">진단 결과</p>' +
      '<p class="result-card__stageno">' + res.stage + "단계</p>" +
      '<h2 class="result-card__name">' + esc(stage.name) + "</h2>" +
      '<p class="result-card__period">' + esc(stage.period) + "</p>" +
      '<div class="rbar">' + steps + "</div>" +
      '<p class="result-card__summary">' + esc(stage.summary) + "</p>" +
      extras +
      '<div class="rsup-box">' +
      '<p class="rsup-box__title">지금 확인해 보실 지원사업 3가지</p>' +
      supHtml +
      '<p class="rsup-box__more"><a href="support.html?stage=' + res.stage + '">이 단계 지원사업 전체 보기 →</a></p>' +
      "</div>" +
      '<div class="rcaution">' +
      '<p class="rcaution__title">이것 하나만은 주의해 주십시오</p>' +
      '<p class="rcaution__body">' + esc((CHECK.cautions || {})[res.stage] || "") + "</p>" +
      "</div>" +
      '<div class="result-card__btns no-print">' +
      '<a class="btn-primary" href="stage-' + res.stage + '.html">내 단계 가이드 보기</a>' +
      '<button type="button" class="btn-line" id="btn-pdf">결과지 PDF로 받기</button>' +
      '<a class="btn-line" href="contact.html?' + params + '">이 결과로 무료 상담 신청</a>' +
      "</div>" +
      '<p class="result-card__scenario no-print"><a href="' + scenario.href + '">' + scenario.text + "</a></p>" +
      "</div>" +
      '<p class="result-note no-print">진단 결과는 참고용 안내입니다. 실제 신청 자격은 각 사업의 공고 기준에 따릅니다. ' +
      '입력하신 답은 저장되지 않으며, 창을 닫으면 사라집니다.</p>' +
      '<button type="button" class="btn-reset no-print" id="btn-again">다시 진단하기</button>';

    quizEl.hidden = true;
    resultEl.hidden = false;

    document.getElementById("btn-again").addEventListener("click", function () {
      answers = {};
      history = [];
      cursor = 0;
      quizEl.hidden = false;
      resultEl.hidden = true;
      renderQuestion();
      window.scrollTo(0, 0);
    });

    document.getElementById("btn-pdf").addEventListener("click", function () {
      openModal(res);
    });

    window.scrollTo(0, 0);
  }

  /* ============================================================
     결과지 받기 팝업 (자료실 팝업과 같은 형태)
     ※ 입력값은 저장되지 않습니다.
     ============================================================ */
  var modal = document.getElementById("get-modal");
  var form = document.getElementById("get-form");
  var stepForm = document.getElementById("get-step-form");
  var stepDone = document.getElementById("get-step-done");
  var doneBody = document.getElementById("get-done-body");
  var lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    stepForm.hidden = false;
    stepDone.hidden = true;
    form.reset();
    modal.hidden = false;
    document.body.classList.add("is-modal-open");
    var first = document.getElementById("get-name");
    if (first) first.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("is-modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  modal.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close")) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var submitBtn = form.querySelector(".btn-submit");
    var errEl = document.getElementById("get-error");

    submitBtn.disabled = true;
    submitBtn.textContent = "저장하고 있습니다...";
    errEl.hidden = true;

    window.GEOSANG_DB.saveLead({
      name: document.getElementById("get-name").value.trim(),
      email: document.getElementById("get-email").value.trim(),
      phone: document.getElementById("get-phone").value.trim(),
      source: "check",
      item: lastResultText
    })
      .then(function () {
        showDone();
      })
      .catch(function (err) {
        errEl.hidden = false;
        errEl.textContent =
          "저장 중 문제가 생겼습니다. 인터넷 연결을 확인하신 뒤 다시 눌러 주십시오. (" + err.message + ")";
      })
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "동의하고 받기";
      });
  });

  function showDone() {
    doneBody.innerHTML =
      '<p class="get-done__msg">' + window.GEOSANG_DB.DONE_MESSAGE + "</p>" +
      '<p class="get-done__sub">결과지는 지금 바로 저장하실 수 있습니다.</p>' +
      '<p class="get-done__sub">아래 버튼을 누르면 인쇄 창이 열립니다. 인쇄 대상에서 ' +
      "<strong>“PDF로 저장”</strong>을 고르시면 결과지가 파일로 저장됩니다.</p>" +
      '<button type="button" class="btn-download" id="btn-print">결과지 PDF로 저장하기</button>' +
      '<p class="get-done__sub" style="margin-top:12px">결과지 파일을 메일로 보내 드리는 기능은 준비 중입니다. ' +
      "준비되는 대로 입력하신 메일 주소로 보내 드리겠습니다.</p>";

    stepForm.hidden = true;
    stepDone.hidden = false;

    document.getElementById("btn-print").addEventListener("click", function () {
      closeModal();
      window.setTimeout(function () {
        window.print();
      }, 200);
    });
  }

  /* ============================================================
     시작
     ============================================================ */
  renderQuestion();
})();
