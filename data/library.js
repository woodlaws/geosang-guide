/* ============================================================
   거상 창업내비 — 서식·양식 자료실 목록
   library.html 이 이 파일을 읽어 목록을 만듭니다.

   [항목 설명]
   slug     주소 뒤에 붙는 이름표입니다. 단계 페이지에서
            library.html#slug 로 연결되어 있으니 바꾸지 마십시오.
   aliases  같은 양식을 가리키는 다른 이름표들입니다.
   name     양식 이름
   category 사업계획서 / 인허가·등록 / 계약서 / 세무·회계 / 인사·노무 / 폐업·재창업
   desc     한 줄 설명
   includes 묶음 양식에 들어 있는 파일 목록 (없으면 생략)
   file     files/ 폴더 안의 실제 파일 이름
   ready    true 로 바꾸면 다운로드 버튼이 살아납니다.
            false 면 "준비 중"으로 표시됩니다.

   ※ 양식 파일을 files/ 폴더에 넣으신 뒤 ready 를 true 로 바꿔 주십시오.
   ============================================================ */

window.LIBRARY_DATA = {
  categories: ["사업계획서", "인허가·등록", "계약서", "세무·회계", "인사·노무", "폐업·재창업"],

  items: [
    {
      slug: "business-plan-psst",
      aliases: [],
      name: "사업계획서 PSST 양식",
      category: "사업계획서",
      desc: "정부지원사업 표준 형식입니다. 문제 인식 · 실현 가능성 · 성장 전략 · 팀 구성 네 부분으로 구성됩니다.",
      file: "사업계획서-PSST-양식.docx",
      ready: false
    },
    {
      slug: "personal-finance-check",
      aliases: [],
      name: "개인 재무 점검표",
      category: "사업계획서",
      desc: "창업 전에 생활비 · 부채 · 고정지출을 한 장으로 정리하는 양식입니다. 버틸 수 있는 개월 수가 계산됩니다.",
      file: "개인-재무-점검표.xlsx",
      ready: false
    },
    {
      slug: "breakeven",
      aliases: [],
      name: "손익분기 계산표",
      category: "사업계획서",
      desc: "월 고정비와 객단가를 넣으면 손해를 보지 않기 위한 최소 매출이 계산됩니다.",
      file: "손익분기-계산표.xlsx",
      ready: false
    },
    {
      slug: "starter-pack",
      aliases: ["market-research"],
      name: "예비창업 스타터팩 (묶음)",
      category: "사업계획서",
      desc: "예비창업 단계에서 필요한 양식을 한 번에 묶었습니다. 1단계를 준비하시는 분께 권해 드립니다.",
      includes: [
        "사업계획서 PSST 양식",
        "시장조사 템플릿",
        "손익분기 계산표",
        "개인 재무 점검표"
      ],
      file: "예비창업-스타터팩.zip",
      ready: false
    },
    {
      slug: "lease-contract",
      aliases: [],
      name: "상가 임대차 계약 전 체크리스트",
      category: "계약서",
      desc: "계약서에 서명하기 전에 확인하셔야 할 항목을 정리했습니다. 원상복구 조항과 권리금 항목이 포함되어 있습니다.",
      file: "상가-임대차-계약전-체크리스트.pdf",
      ready: false
    },
    {
      slug: "nda",
      aliases: ["service-contract", "partnership-contract"],
      name: "비밀유지계약서 (NDA)",
      category: "계약서",
      desc: "외부 업체나 협업 상대에게 사업 내용을 공개하기 전에 사용하십시오. 용역계약서 양식도 함께 들어 있습니다.",
      file: "비밀유지계약서.docx",
      ready: false
    },
    {
      slug: "tax-calendar",
      aliases: [],
      name: "1년 세무 일정표",
      category: "세무·회계",
      desc: "부가가치세 · 종합소득세 · 원천세 신고 시기를 한 장에 정리한 표입니다.",
      file: "1년-세무-일정표.pdf",
      ready: false
    },
    {
      slug: "quotation",
      aliases: ["transaction-statement", "tax-invoice-guide"],
      name: "견적서 · 거래명세서 양식",
      category: "세무·회계",
      desc: "거래에 바로 쓰실 수 있는 견적서와 거래명세서 양식입니다. 세금계산서 발행 가이드를 함께 넣었습니다.",
      file: "견적서-거래명세서-양식.xlsx",
      ready: false
    },
    {
      slug: "employment-contract",
      aliases: ["insurance-guide", "payroll-book"],
      name: "표준 근로계약서 + 4대보험 신고 가이드",
      category: "인사·노무",
      desc: "첫 직원을 채용하실 때 필요합니다. 근로계약서 작성과 교부는 법으로 정해진 의무입니다.",
      file: "표준-근로계약서-4대보험-가이드.zip",
      ready: false
    },
    {
      slug: "closure-form",
      aliases: ["restoration-quote", "debt-counsel-checklist"],
      name: "폐업 · 재창업 체크리스트",
      category: "폐업·재창업",
      desc: "폐업 신고 순서와 원상복구 · 채무조정 상담 시 확인할 항목을 정리했습니다. 지원금 신청 순서도 함께 안내합니다.",
      file: "폐업-재창업-체크리스트.pdf",
      ready: false
    }
  ]
};
