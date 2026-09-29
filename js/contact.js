/* ============================================================
   거상창업가이드 — 상담 신청 (contact.html)

   1. 다른 페이지에서 넘어온 값(진단 결과 · 상담 분야 · 양식 이름)을
      주소에서 읽어 자동으로 채웁니다.
   2. 신청 내용을 consultations 표에 저장합니다.
   ============================================================ */

(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var STAGES = (window.STAGE_DATA && window.STAGE_DATA.stages) || [];

  var noteEl = document.getElementById("from-note");
  var doneEl = document.getElementById("contact-done");
  var errEl = document.getElementById("c-error");
  var submitBtn = document.getElementById("c-submit");

  var fieldSel = document.getElementById("c-field");
  var diagInput = document.getElementById("c-diagnosis");
  var msgInput = document.getElementById("c-message");

  /* --- 주소에서 값 읽기 --- */
  function param(name) {
    var m = window.location.search.match(new RegExp("[?&]" + name + "=([^&]*)"));
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : "";
  }

  var from = param("from");
  var stage = param("stage");
  var fieldFromUrl = param("field");
  var doc = param("doc");
  var expert = param("expert"); /* 전문가 페이지에서 넘어온 직업명 (예 : 세무사) */

  /* 진단 결과 자동 입력 */
  if (stage !== "" && STAGES[Number(stage)]) {
    var s = STAGES[Number(stage)];
    diagInput.value = s.no + "단계 " + s.name;
  }

  /* 전문가 페이지에서 넘어온 상담 분야 자동 선택 */
  if (fieldFromUrl) {
    for (var i = 0; i < fieldSel.options.length; i++) {
      if (fieldSel.options[i].value === fieldFromUrl) {
        fieldSel.value = fieldFromUrl;
        break;
      }
    }
  }

  /* 어디에서 오셨는지 안내 문구 */
  var noteText = "";
  if (from === "check" && diagInput.value) {
    noteText = "3분 진단 결과(" + diagInput.value + ")를 함께 보내 드립니다. 그대로 신청하시면 됩니다.";
  } else if (from === "expert" && expert) {
    noteText = expert + " 연결 요청으로 접수됩니다. 아래 내용만 채워 주시면 됩니다.";
    if (!msgInput.value) msgInput.value = expert + " 연결을 요청드립니다.";
  } else if (from === "expert" && fieldFromUrl) {
    noteText = fieldFromUrl + " 문의로 접수됩니다.";
  } else if (from === "support") {
    noteText = "지원사업 안내 요청으로 접수됩니다.";
    if (!fieldSel.value) fieldSel.value = "지원사업";
  } else if (from === "library" || doc) {
    noteText = "자료실 양식 문의로 접수됩니다.";
    if (doc && !msgInput.value) {
      msgInput.value = "자료실에서 [" + doc + "] 양식을 요청드립니다.";
    }
  } else if (stage !== "" && diagInput.value) {
    noteText = diagInput.value + " 안내 요청으로 접수됩니다.";
  }

  if (noteText) {
    noteEl.hidden = false;
    noteEl.textContent = noteText;
  }

  /* --- 저장 --- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "접수하고 있습니다...";
    errEl.hidden = true;

    window.GEOSANG_DB.saveConsultation({
      name: document.getElementById("c-name").value.trim(),
      phone: document.getElementById("c-phone").value.trim(),
      email: document.getElementById("c-email").value.trim(),
      field: fieldSel.value,
      diagnosis: diagInput.value.trim(),
      message: msgInput.value.trim()
    })
      .then(function () {
        form.hidden = true;
        if (noteEl) noteEl.hidden = true;
        doneEl.hidden = false;
        doneEl.scrollIntoView({ behavior: "smooth", block: "center" });
      })
      .catch(function (err) {
        errEl.hidden = false;
        errEl.textContent =
          "접수 중 문제가 생겼습니다. 인터넷 연결을 확인하신 뒤 다시 눌러 주십시오. (" + err.message + ")";
        submitBtn.disabled = false;
        submitBtn.textContent = "상담 신청하기";
      });
  });
})();
