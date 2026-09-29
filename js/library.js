/* ============================================================
   거상창업가이드 — 서식·양식 자료실 (library.html)
   data/library.js 내용으로 목록을 만들고,
   카테고리 탭 · 받기 팝업(모달) 동작을 담당합니다.

   ※ 입력하신 이름·이메일·연락처는 지금은 어디에도 저장되지 않습니다.
     화면 동작만 만들어 둔 상태이며, 저장은 6단계에서 연결할 예정입니다.
   ============================================================ */

(function () {
  "use strict";

  var listEl = document.getElementById("lib-list");
  if (!listEl) return;

  var DATA = window.LIBRARY_DATA;
  var items = DATA && DATA.items ? DATA.items : [];
  var categories = DATA && DATA.categories ? DATA.categories : [];

  var tabsEl = document.getElementById("lib-tabs");
  var noticeEl = document.getElementById("lib-notice");

  if (!items.length) {
    listEl.innerHTML = '<li class="notice">양식 목록을 불러오지 못했습니다. data/library.js 파일을 확인해 주십시오.</li>';
    return;
  }

  function esc(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var currentCat = "all";

  /* ============================================================
     탭 만들기
     ============================================================ */
  function renderTabs() {
    var all = '<button type="button" class="lib-tab' + (currentCat === "all" ? " is-on" : "") + '" data-cat="all">전체</button>';
    tabsEl.innerHTML =
      all +
      categories
        .map(function (c) {
          var n = items.filter(function (it) {
            return it.category === c;
          }).length;
          return (
            '<button type="button" class="lib-tab' + (currentCat === c ? " is-on" : "") + '" data-cat="' + esc(c) + '">' +
            esc(c) +
            '<span class="lib-tab__n">' + n + "</span>" +
            "</button>"
          );
        })
        .join("");
  }

  /* ============================================================
     목록 만들기
     ============================================================ */
  function renderList() {
    var list = items.filter(function (it) {
      return currentCat === "all" || it.category === currentCat;
    });

    if (!list.length) {
      listEl.innerHTML =
        '<li class="sp-empty">이 분류의 양식은 준비 중입니다. 준비되는 대로 올려 드리겠습니다.</li>';
      return;
    }

    listEl.innerHTML = list
      .map(function (it) {
        var includes = it.includes
          ? '<ul class="lib-card__includes">' +
            it.includes
              .map(function (f) {
                return "<li>" + esc(f) + "</li>";
              })
              .join("") +
            "</ul>"
          : "";

        var btn = it.ready
          ? '<button type="button" class="btn-get" data-slug="' + esc(it.slug) + '">받기</button>'
          : '<button type="button" class="btn-get is-wait" data-slug="' + esc(it.slug) + '">준비 중</button>';

        return (
          '<li class="lib-card" id="' + esc(it.slug) + '">' +
          '<div class="lib-card__body">' +
          '<span class="lib-card__cat">' + esc(it.category) + "</span>" +
          '<h3 class="lib-card__name">' + esc(it.name) + "</h3>" +
          '<p class="lib-card__desc">' + esc(it.desc) + "</p>" +
          includes +
          '<p class="lib-card__file">' +
          (it.ready ? "파일 " + esc(it.file) : "양식 파일 준비 중입니다. (" + esc(it.file) + ")") +
          "</p>" +
          "</div>" +
          '<div class="lib-card__foot">' + btn + "</div>" +
          "</li>"
        );
      })
      .join("");
  }

  function render() {
    renderTabs();
    renderList();
  }

  /* --- 탭 누름 --- */
  tabsEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".lib-tab");
    if (!btn) return;
    currentCat = btn.getAttribute("data-cat");
    render();
  });

  /* ============================================================
     받기 팝업(모달)
     ============================================================ */
  var modal = document.getElementById("get-modal");
  var form = document.getElementById("get-form");
  var stepForm = document.getElementById("get-step-form");
  var stepDone = document.getElementById("get-step-done");
  var titleEl = document.getElementById("get-title");
  var doneBody = document.getElementById("get-done-body");
  var lastFocus = null;
  var picked = null;

  function findBySlug(slug) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].slug === slug) return items[i];
    }
    return null;
  }

  function openModal(item) {
    picked = item;
    lastFocus = document.activeElement;

    titleEl.textContent = item.name;
    stepForm.hidden = false;
    stepDone.hidden = true;
    form.reset();

    modal.hidden = false;
    document.body.classList.add("is-modal-open");

    var first = form.querySelector("#get-name");
    if (first) first.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("is-modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  listEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".btn-get");
    if (!btn) return;
    var item = findBySlug(btn.getAttribute("data-slug"));
    if (item) openModal(item);
  });

  /* 닫기 : X 버튼, 바깥 어두운 곳, Esc 키 */
  modal.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close")) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  /* 제출 : 신청 내용을 저장한 뒤 다음 화면을 보여 줍니다 */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!picked) return;

    var submitBtn = form.querySelector(".btn-submit");
    var errEl = document.getElementById("get-error");

    submitBtn.disabled = true;
    submitBtn.textContent = "저장하고 있습니다...";
    errEl.hidden = true;

    window.GEOSANG_DB.saveLead({
      name: document.getElementById("get-name").value.trim(),
      email: document.getElementById("get-email").value.trim(),
      phone: document.getElementById("get-phone").value.trim(),
      source: "library",
      item: picked.name
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
    if (picked.ready) {
      doneBody.innerHTML =
        '<p class="get-done__msg">' + window.GEOSANG_DB.DONE_MESSAGE + "</p>" +
        '<p class="get-done__sub">' + esc(picked.name) + " 양식을 지금 내려받으실 수 있습니다.</p>" +
        '<a class="btn-download" href="files/' + encodeURIComponent(picked.file) + '" download>' +
        esc(picked.file) + " 내려받기</a>";
    } else {
      doneBody.innerHTML =
        '<p class="get-done__msg">' + window.GEOSANG_DB.DONE_MESSAGE + "</p>" +
        '<p class="get-done__sub">' + esc(picked.name) + " 양식은 아직 준비 중입니다. 준비되는 대로 보내 드리겠습니다.</p>" +
        '<a class="btn-download is-wait" href="contact.html?doc=' + encodeURIComponent(picked.slug) + '">상담으로 함께 문의하기</a>';
    }

    stepForm.hidden = true;
    stepDone.hidden = false;
  }

  /* ============================================================
     다른 페이지에서 특정 양식으로 들어온 경우
     예) library.html#lease-contract
     ============================================================ */
  function gotoHash() {
    var hash = decodeURIComponent((window.location.hash || "").replace("#", ""));
    if (!hash) return;

    var found = null;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.slug === hash || (it.aliases || []).indexOf(hash) !== -1) {
        found = it;
        break;
      }
    }

    if (!found) {
      noticeEl.hidden = false;
      noticeEl.textContent =
        "요청하신 양식은 아직 자료실에 등록되지 않았습니다. 준비되는 대로 올려 드리겠습니다. 아래 목록에서 다른 양식을 확인해 주십시오.";
      return;
    }

    currentCat = found.category;
    render();

    var card = document.getElementById(found.slug);
    if (card) {
      card.classList.add("is-target");
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  render();
  gotoHash();
  window.addEventListener("hashchange", gotoHash);
})();
