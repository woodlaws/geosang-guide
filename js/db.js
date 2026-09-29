/* ============================================================
   거상창업가이드 — 신청 정보 저장 (Supabase)

   프로젝트 이름 : geosang-navi (서울 리전)
   테이블 2개    : leads(자료 받기 신청) / consultations(상담 신청)

   아래 두 값은 웹페이지에 공개되어도 안전한 "공개용 키"입니다.
   이 키로는 입력만 되고, 저장된 내용을 읽거나 지울 수는 없습니다.
   (Supabase 보안 규칙 RLS 로 막아 두었습니다.)

   저장된 내용을 보시려면 supabase.com 에 로그인하신 뒤
   geosang-navi 프로젝트의 Table Editor 에서 확인하십시오.
   ============================================================ */

window.GEOSANG_DB = (function () {
  "use strict";

  var URL = "https://zumwqevkraqyuhipgnjh.supabase.co";
  var KEY = "sb_publishable_KnDclWqHbmCsuUtoNWh3_A_vwxqgIIo";

  /* 표에 한 줄 넣기 */
  function insert(table, row) {
    return fetch(URL + "/rest/v1/" + table, {
      method: "POST",
      headers: {
        apikey: KEY,
        Authorization: "Bearer " + KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(row)
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (text) {
          throw new Error("저장에 실패했습니다. (" + res.status + ") " + text);
        });
      }
      return true;
    });
  }

  return {
    /* 자료실 양식 받기 / 진단 결과지 받기 */
    saveLead: function (data) {
      return insert("leads", {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        source: data.source, /* library / check / contact */
        item: data.item || null,
        agreed: true
      });
    },

    /* 상담 신청 */
    saveConsultation: function (data) {
      return insert("consultations", {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        field: data.field,
        diagnosis: data.diagnosis || null,
        message: data.message || null,
        agreed: true
      });
    },

    /* 신청 완료 문구 (세 곳에서 같은 문장을 씁니다) */
    DONE_MESSAGE: "신청이 접수되었습니다. 영업일 기준 1일 이내 연락드리겠습니다."
  };
})();
