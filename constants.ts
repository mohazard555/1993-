
import React from 'react';
import { 
  BrainCircuit, Feather, BookOpen, Sparkles, UserCheck, TextQuote, Wand2, Lightbulb, 
  Mail, FileText, Share2, Heart, Puzzle, Tags, Sunrise, Cloudy, Video, Music, Quote, 
  MessageSquare, FileQuestion, GraduationCap, BarChart2, ScanText 
} from 'lucide-react';
import { ServiceConfig, ServiceType } from './types';

// ==========================================
// Non-configurable constants
// ==========================================

export const ZODIAC_SIGNS: string[] = [
  "الحمل", "الثور", "الجوزاء", "السرطان", "الأسد", "العذراء", 
  "الميزان", "العقرب", "القوس", "الجدي", "الدلو", "الحوت"
];

// FIX: Replaced JSX syntax with React.createElement to resolve parsing errors in this .ts file,
// which is likely not configured to transpile JSX.
export const SERVICE_CONFIGS: Record<ServiceType, ServiceConfig> = {
  [ServiceType.GENERAL]: {
    type: ServiceType.GENERAL,
    title: 'اكتب ما تفكر به',
    icon: React.createElement(BrainCircuit, { className: "w-8 h-8 text-cyan-300" }),
    placeholder: 'اكتب فكرة ليتم توليد نص متكامل عنها (شرح، خطة، مقال، اقتراح...).',
    inputType: 'textarea',
    promptPrefix: 'اكتب مقالاً مفصلاً عن: ',
  },
  [ServiceType.POEM]: {
    type: ServiceType.POEM,
    title: 'توليد الشعر',
    icon: React.createElement(Feather, { className: "w-8 h-8 text-pink-300" }),
    placeholder: 'أدخل موضوع القصيدة...',
    inputType: 'text',
    promptPrefix: 'اكتب قصيدة بأسلوب أدبي بليغ عن: ',
  },
  [ServiceType.STORY]: {
    type: ServiceType.STORY,
    title: 'توليد القصص',
    icon: React.createElement(BookOpen, { className: "w-8 h-8 text-amber-300" }),
    placeholder: 'أدخل فكرة أو عنوان القصة...',
    inputType: 'text',
    promptPrefix: 'اكتب قصة قصيرة ومشوّقة عن: ',
  },
  [ServiceType.HOROSCOPE]: {
    type: ServiceType.HOROSCOPE,
    title: 'الأبراج الترفيهي',
    icon: React.createElement(Sparkles, { className: "w-8 h-8 text-purple-300" }),
    placeholder: 'اختر برجك...',
    inputType: 'select',
    options: ZODIAC_SIGNS,
    promptPrefix: 'اكتب تحليلاً يومياً ترفيهياً ومضحكاً بأسلوب ظريف لبرج ',
  },
  [ServiceType.PERSONALITY_ANALYSIS]: {
    type: ServiceType.PERSONALITY_ANALYSIS,
    title: 'تحليل الشخصية',
    icon: React.createElement(UserCheck, { className: "w-8 h-8 text-teal-300" }),
    placeholder: 'أدخل نصاً لوصف شخصية أو سلوك معين لتحليله...',
    inputType: 'textarea',
    promptPrefix: 'اكتب تحليل شخصية بناءً على النص التالي الذي يصف شخصًا ما: ',
  },
  [ServiceType.SUMMARY]: {
    type: ServiceType.SUMMARY,
    title: 'ملخص النصوص',
    icon: React.createElement(TextQuote, { className: "w-8 h-8 text-blue-300" }),
    placeholder: 'أدخل نصًا طويلًا ليتم تلخيصه باحتراف.',
    inputType: 'textarea',
    promptPrefix: 'لخص النص التالي بشكل احترافي وموجز: ',
  },
  [ServiceType.WRITING_IMPROVER]: {
    type: ServiceType.WRITING_IMPROVER,
    title: 'تحسين الكتابة',
    icon: React.createElement(Wand2, { className: "w-8 h-8 text-indigo-300" }),
    placeholder: 'لتحسين الأسلوب، تصحيح الأخطاء، أو إعادة الصياغة.',
    inputType: 'textarea',
    promptPrefix: 'قم بتحسين النص التالي من حيث الأسلوب والقواعد النحوية والإملائية وأعد صياغته ليكون أكثر بلاغة ووضوحًا: ',
  },
  [ServiceType.IDEA_GENERATOR]: {
    type: ServiceType.IDEA_GENERATOR,
    title: 'اقتراح أفكار',
    icon: React.createElement(Lightbulb, { className: "w-8 h-8 text-yellow-300" }),
    placeholder: 'اقتراح أفكار مشاريع أو محتوى للمبدعين وأصحاب المشاريع.',
    inputType: 'text',
    promptPrefix: 'اقترح 5 أفكار مشاريع أو محتوى إبداعية ومبتكرة في مجال: ',
  },
  [ServiceType.EMAIL_WRITER]: {
    type: ServiceType.EMAIL_WRITER,
    title: 'كاتب البريد الإلكتروني الذكي',
    icon: React.createElement(Mail, { className: "w-8 h-8 text-sky-300" }),
    placeholder: 'يكتب أو يصيغ رسائل البريد بأسلوب احترافي.',
    inputType: 'textarea',
    promptPrefix: 'اكتب بريدًا إلكترونيًا احترافيًا بناءً على الوصف التالي: ',
  },
  [ServiceType.CV_WRITER]: {
    type: ServiceType.CV_WRITER,
    title: 'كاتب السيرة الذاتية / CV',
    icon: React.createElement(FileText, { className: "w-8 h-8 text-slate-300" }),
    placeholder: 'يولد نصوص سيرة ذاتية جاهزة انطلاقًا من بيانات بسيطة.',
    inputType: 'textarea',
    promptPrefix: 'اكتب فقرة احترافية للسيرة الذاتية (Profile Summary) بناءً على المعلومات التالية: ',
  },
  [ServiceType.SOCIAL_MEDIA_POST]: {
    type: ServiceType.SOCIAL_MEDIA_POST,
    title: 'منشئ منشورات التواصل',
    icon: React.createElement(Share2, { className: "w-8 h-8 text-rose-300" }),
    placeholder: 'لتوليد محتوى لمنصات مثل إنستغرام أو تويتر أو تيك توك.',
    inputType: 'textarea',
    promptPrefix: 'أنشئ منشورًا جذابًا لوسائل التواصل الاجتماعي بناءً على الفكرة التالية (مع إضافة هاشتاجات مناسبة): ',
  },
  [ServiceType.RELATIONSHIP_ANALYSIS]: {
    type: ServiceType.RELATIONSHIP_ANALYSIS,
    title: 'تحليل العلاقات (ترفيهي)',
    icon: React.createElement(Heart, { className: "w-8 h-8 text-red-300" }),
    placeholder: 'تحليل ترفيهي بين اسمين أو برجين.',
    inputType: 'text',
    promptPrefix: 'اكتب تحليل توافق ترفيهي وظريف بين: ',
  },
  [ServiceType.QUIZ]: {
    type: ServiceType.QUIZ,
    title: 'اختبارات شخصية',
    icon: React.createElement(Puzzle, { className: "w-8 h-8 text-orange-300" }),
    placeholder: 'أسئلة تفاعلية تحلل الشخصية.',
    inputType: 'text',
    promptPrefix: 'أنشئ اختبارًا تفاعليًا قصيرًا (3-4 أسئلة) مع نتائج لتحليل الشخصية حول موضوع: ',
  },
  [ServiceType.NAME_GENERATOR]: {
    type: ServiceType.NAME_GENERATOR,
    title: 'مولد أسماء مميزة',
    icon: React.createElement(Tags, { className: "w-8 h-8 text-lime-300" }),
    placeholder: 'لأسماء أطفال، حسابات، قنوات يوتيوب، مشاريع...',
    inputType: 'text',
    promptPrefix: 'اقترح 10 أسماء مميزة وجذابة لـ: ',
  },
  [ServiceType.QUOTE_OF_THE_DAY]: {
    type: ServiceType.QUOTE_OF_THE_DAY,
    title: 'رسالة اليوم / حكمة',
    icon: React.createElement(Sunrise, { className: "w-8 h-8 text-amber-400" }),
    placeholder: 'اكتب "حكمة اليوم" أو اتركها فارغة وانقر "توليد".',
    inputType: 'text',
    promptPrefix: 'اكتب حكمة أو اقتباسًا تحفيزيًا قصيرًا وملهمًا عن ',
  },
  [ServiceType.DREAM_ANALYSIS]: {
    type: ServiceType.DREAM_ANALYSIS,
    title: 'تحليل الأحلام (ترفيهي)',
    icon: React.createElement(Cloudy, { className: "w-8 h-8 text-violet-300" }),
    placeholder: 'المستخدم يكتب حلمه، والنظام يعطي تفسيرًا بأسلوب ذكي وظريف.',
    inputType: 'textarea',
    promptPrefix: 'قدم تفسيرًا ترفيهيًا، ذكيًا، وظريفًا للحلم التالي: ',
  },
  [ServiceType.VIDEO_IDEA_GENERATOR]: {
    type: ServiceType.VIDEO_IDEA_GENERATOR,
    title: 'مولد أفكار فيديوهات',
    icon: React.createElement(Video, { className: "w-8 h-8 text-red-400" }),
    placeholder: 'لتوليد نصوص لمقاطع فيديو قصيرة أو سكريبتات يوتيوب.',
    inputType: 'text',
    promptPrefix: 'اكتب 3 أفكار فيديوهات مع سكريبت موجز لكل فكرة حول الموضوع التالي: ',
  },
  [ServiceType.LYRIC_GENERATOR]: {
    type: ServiceType.LYRIC_GENERATOR,
    title: 'مولد كلمات أغاني',
    icon: React.createElement(Music, { className: "w-8 h-8 text-fuchsia-300" }),
    placeholder: 'يكتب المستخدم موضوع الأغنية ليتم توليد كلمات مناسبة.',
    inputType: 'text',
    promptPrefix: 'اكتب كلمات أغنية بناءً على الموضوع والمزاج التالي: ',
  },
  [ServiceType.QUOTE_GENERATOR]: {
    type: ServiceType.QUOTE_GENERATOR,
    title: 'مولد اقتباسات',
    icon: React.createElement(Quote, { className: "w-8 h-8 text-green-300" }),
    placeholder: 'مولد اقتباسات أدبية أو تحفيزية.',
    inputType: 'text',
    promptPrefix: 'اكتب 3 اقتباسات أدبية أو تحفيزية فريدة حول: ',
  },
  [ServiceType.DIALOGUE_GENERATOR]: {
    type: ServiceType.DIALOGUE_GENERATOR,
    title: 'توليد حوارات',
    icon: React.createElement(MessageSquare, { className: "w-8 h-8 text-cyan-400" }),
    placeholder: 'قسم ممتع لمحبي القصص.',
    inputType: 'textarea',
    promptPrefix: 'اكتب حوارًا قصيرًا وممتعًا بين الشخصيات وفي الموقف التالي: ',
  },
  [ServiceType.EXAM_GENERATOR]: {
    type: ServiceType.EXAM_GENERATOR,
    title: 'مولد أسئلة امتحانات',
    icon: React.createElement(FileQuestion, { className: "w-8 h-8 text-blue-400" }),
    placeholder: 'توليد أسئلة امتحانات / اختبارات تعليمية.',
    inputType: 'text',
    promptPrefix: 'اكتب 5 أسئلة متنوعة (اختيار من متعدد، صواب/خطأ، سؤال مقالي) مع إجاباتها لمادة: ',
  },
  [ServiceType.CONCEPT_EXPLAINER]: {
    type: ServiceType.CONCEPT_EXPLAINER,
    title: 'شرح الدروس والمفاهيم',
    icon: React.createElement(GraduationCap, { className: "w-8 h-8 text-emerald-300" }),
    placeholder: 'يكتب المستخدم مفهوماً، والنظام يشرحه بأسلوب مبسط.',
    inputType: 'text',
    promptPrefix: 'اشرح المفهوم التالي بأسلوب مبسط وواضح ومناسب لغير المتخصصين: ',
  },
  [ServiceType.PROJECT_ANALYSIS]: {
    type: ServiceType.PROJECT_ANALYSIS,
    title: 'تحليل أفكار المشاريع',
    icon: React.createElement(BarChart2, { className: "w-8 h-8 text-yellow-400" }),
    placeholder: 'تحليل أفكار المشاريع / دراسات جدوى مبسطة.',
    inputType: 'textarea',
    promptPrefix: 'قم بتحليل فكرة المشروع التالية وقدم دراسة جدوى مبسطة تشمل نقاط القوة، نقاط الضعف، الفرص، والتهديدات (SWOT Analysis): ',
  },
  [ServiceType.TEXT_ANALYSIS]: {
    type: ServiceType.TEXT_ANALYSIS,
    title: 'تحليل النصوص والمقالات',
    icon: React.createElement(ScanText, { className: "w-8 h-8 text-teal-400" }),
    placeholder: 'تحليل النصوص أو المقالات (نغمة، أسلوب، هدف).',
    inputType: 'textarea',
    promptPrefix: 'حلل النص التالي من حيث النغمة (Tone)، الأسلوب (Style)، والهدف الأساسي للكاتب (Author\'s purpose): ',
  }
};
