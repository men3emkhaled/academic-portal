const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN,   // ← سيقروء القيمة من متغيرات البيئة
  orgId: process.env.AXIOM_ORG_ID,
});