import type {TranslationKey} from "../../lib/i18n";

// Las mismas preguntas, con el mismo texto en español, se publican como datos estructurados (FAQPage) en index.html;
// seo.test.tsx verifica que coincidan.
export const FAQ: { question: TranslationKey; answer: TranslationKey }[] = [
    {question: "faq.q1", answer: "faq.a1"},
    {question: "faq.q2", answer: "faq.a2"},
    {question: "faq.q3", answer: "faq.a3"},
    {question: "faq.q4", answer: "faq.a4"},
    {question: "faq.q5", answer: "faq.a5"},
    {question: "faq.q6", answer: "faq.a6"},
    {question: "faq.q7", answer: "faq.a7"},
];
