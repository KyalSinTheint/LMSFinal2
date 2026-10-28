/**
 * KBZLIFE Employee Learning Portal
 * Page 1: Our Company Content Data Structure
 * 
 * Updated with official KBZLIFE Insurance company information,
 * Burmese vision, mission, purpose, core values, aspirations, and contact info.
 */

export interface CoreValueItem {
  id: string;
  number: number;
  title: string;
  burmeseSubtitle: string;
  description: string;
  iconName: 'Shield' | 'Users' | 'Sparkles' | 'Heart' | 'Target' | 'Award' | 'Briefcase';
}

export interface AspirationItem {
  id: string;
  paragraph: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  website: string;
  addresses: {
    city: string;
    address: string;
  }[];
  socialLinks: {
    name: string;
    url: string;
  }[];
}

export interface CompanyContentData {
  hero: {
    eyebrow: string;
    heading: string;
    subheading: string;
    anchorText: string;
    anchorTarget: string;
    imageUrl: string | null;
    imageCaption: string;
  };
  ceoMotto: {
    motto: string;
    ceoName: string;
    ceoTitle: string;
    photoUrl: string | null;
    photoCaption: string;
    statementContext: string;
  };
  about: {
    heading: string;
    paragraphs: string[];
    imageUrl: string | null;
    imageCaption: string;
  };
  vision: {
    heading: string;
    burmeseStatement: string;
    englishStatement: string;
    imageUrl?: string | null;
    imageCaption?: string;
  };
  mission: {
    heading: string;
    burmeseStatement: string;
    englishStatement: string;
    imageUrl?: string | null;
    imageCaption?: string;
  };
  purpose: {
    heading: string;
    burmeseStatement: string;
    englishStatement: string;
    imageUrl?: string | null;
    imageCaption?: string;
  };
  coreValues: {
    heading: string;
    intro: string;
    items: CoreValueItem[];
  };
  aspirations: {
    burmeseHeading: string;
    englishSubtitle: string;
    intro: string;
    items: AspirationItem[];
  };
  contact: ContactInfo;
}

/**
 * Official KBZLIFE Content
 */
export const defaultCompanyContent: CompanyContentData = {
  hero: {
    eyebrow: '',
    heading: 'Welcome to KBZLIFE Insurance',
    subheading: 'The Right Insurance For You',
    anchorText: 'Explore our purpose & values',
    anchorTarget: '#our-purpose',
    imageUrl: '/assets/aistudio/6-2-1024x683_b78785ee.jpg',
    imageCaption: 'Welcome to KBZLIFE Insurance',
  },
  ceoMotto: {
    motto: "“My goal as your CEO is to clear the path so you can perform at your best. We created this internal portal to simplify your daily activities and provide direct access to the training you need to level up.\n\nSuccess isn't found in staying stuck in old habits; it’s found in the curiosity to learn something new every day. I invite you to use these materials to sharpen your skills. Let’s move away from the 'easy-going' mindset and strive for the professional growth you deserve.”",
    ceoName: 'U Han Win Hlaing',
    ceoTitle: 'Chief Executive Officer, KBZ Life Insurance',
    photoUrl: '/assets/aistudio/CEO_38bdec3d.jpg',
    photoCaption: 'U Han Win Hlaing, Chief Executive Officer',
    statementContext: 'Executive Leadership Statement for all KBZLIFE team members nationwide.',
  },
  about: {
    heading: 'KBZ Life Insurance အကြောင်း',
    paragraphs: [
      'KBZ Life Insurance အား စက်တင်ဘာလ ၂၀၁၂ တွင် စတင်တည်ထောင်ခဲ့ပြီး IKBZ Insurance အမည်ဖြင့် အထွေအထွေအာမခံနှင့် အသက်အာမခံ ဝန်ဆောင်မှု နှစ်မျိုးလုံးကို ဝန်ဆောင်မှုပေးခဲ့ပါသည်။',
      'ဇွန်လ ၂၀၁၉တွင် IKBZ Insuranceမှ KBZMS General နှင့် KBZ Life ဟူ၍ လုပ်ငန်းခွဲ နှစ်ခုအဖြစ် သီးခြားခွဲခဲ့ပြီး KBZ Life သည် အသက်အာမခံလုပ်ငန်းကို ကျွမ်းကျင်စွာကိုင်တွယ်နိုင်သည့် အတွေ့အကြုံနှင့် မှန်ကန်ကောင်းမွန်သည့် ဝန်ဆောင်မှုအားပေးနိုင်ရန် ရည်ရွယ်ထားသည့်အတွက် မြန်မာနိုင်ငံပြည်တွင်းကုမ္ပဏီအဖြစ် ဝင့်ကြွားစွာ ဆက်လက်တည်ရှိနေပါသည်။',
    ],
    imageUrl: '/assets/aistudio/KBZL_cb546615.png',
    imageCaption: 'KBZ LIFE Insurance',
  },
  vision: {
    heading: 'ကျွန်ုပ်တို့၏အမြင် (Our Vision)',
    burmeseStatement: 'ကမ္ဘာပေါ်တွင် အကောင်းဆုံး စီမံခန့်ခွဲနိုင်သော Insurtech ကုမ္ပဏီဖြစ်ရန်',
    englishStatement: 'To be the best managed insurtech company in the world',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Global Insurtech & Digital Innovation Vision',
  },
  mission: {
    heading: 'ကျွန်ုပ်တို့၏ရည်မှန်းချက် (Our Mission)',
    burmeseStatement: 'အားလုံးအတွက် မှန်ကန်သင့်တော်သည့် အာမခံဝန်ဆောင်မှုပေးနိုင်ရန်',
    englishStatement: 'Right insurance for ALL in Myanmar',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Right Insurance for All People in Myanmar',
  },
  purpose: {
    heading: 'ကျွန်ုပ်တို့၏ရည်ရွယ်ချက် (Our Purpose)',
    burmeseStatement: 'မှန်ကန်သောအာမခံနှင့်အတူ မြန်မာပြည်သူပြည်သားများအားအကာအကွယ်ပေးရန်',
    englishStatement: 'To protect people in Myanmar with the right insurance',
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Protecting Myanmar Families and Citizens',
  },
  coreValues: {
    heading: 'ယုံကြည်၀န်ဆောင်မှု (Core Values)',
    intro: 'The guiding principles that shape our workplace culture, ethics, and service excellence across all branches.',
    items: [
      {
        id: 'val-1',
        number: 1,
        title: 'Genuineness',
        burmeseSubtitle: 'စစ်မှန်မှု',
        description: 'မှန်ကန်သော အာမခံအမျိုးအစားများကို အကြံပေးပြီး မြန်မာနိုင်ငံရှိ လူများ၏ ချမ်းသာရေးသုခနှင့်ကျန်းမာရေးသုခကို အကာအကွယ်ပေးသွားပါမည်။',
        iconName: 'Shield',
      },
      {
        id: 'val-2',
        number: 2,
        title: 'Integrity',
        burmeseSubtitle: 'သမာဓိရှိခြင်း',
        description: 'ကျွန်ုပ်တို့သည် ခိုင်မာသော ကိုယ်ကျင့်တရား၊ကျင့်ဝတ်ရှိသူများနှင့် ပေါင်းသင်းဆက်ဆံပြီး မှန်ကန်သောအရာကို လုပ်ဆောင်ရန်သာ စိတ်အားထက်သန်လျက်ရှိပါသည်။',
        iconName: 'Heart',
      },
      {
        id: 'val-3',
        number: 3,
        title: 'Innovation',
        burmeseSubtitle: 'ဆန်းသစ်တီထွင်ခြင်း',
        description: 'အကျိုးဆိုင်သူများအတွက် အကျိုးအမြတ်ဖန်တီးရန် ဆန်းသစ်သောအတွေးအခေါ်နည်းနာရှိသူများကို ကျွန်ုပ်တို့ ကြိုဆိုချီးကျူးလျက်ရှိပါသည်။',
        iconName: 'Sparkles',
      },
      {
        id: 'val-4',
        number: 4,
        title: 'Sharing',
        burmeseSubtitle: 'မျှဝေခြင်း',
        description: 'ကျွန်ုပ်တို့သည် စဉ်ဆက်မပြတ်သင်ယူမှုနှင့် အစဉ်အမြဲသင်ကြားမှုကို အလေးထားပါသည်။',
        iconName: 'Users',
      },
      {
        id: 'val-5',
        number: 5,
        title: 'Respect',
        burmeseSubtitle: 'လေးစားမှု',
        description: 'လူတွေအပေါ် လေးစားမှုရှိခြင်းသည် ကျွန်ုပ်တို့၏အောင်မြင်မှုအတွက် အခြေခံအုတ်မြစ်ဖြစ်ပြီး အဓိကမဏ္ဏိုင် လည်းဖြစ်ပါသည်။',
        iconName: 'Award',
      },
    ],
  },
  aspirations: {
    burmeseHeading: 'ကျွန်ုပ်တို့မှ ရည်မှန်းထားသောအရာ',
    englishSubtitle: 'Our Aspirations & Goals',
    intro: 'Strategic organizational milestones and collective aspirations guiding KBZLIFE into the future.',
    items: [
      {
        id: 'asp-1',
        paragraph: 'ကျွန်ုပ်တို့သည် အာမခံ၏အရေးပါမှုနှင့် အသိပညာဗဟုသုတများအား ပြည်သူများအတွက် ဖြန့်ဝေကူညီအကြံပေးသွားရန် လေးနက်စွာရည်မှန်းထားပါသည်။',
      },
      {
        id: 'asp-2',
        paragraph: 'မတူညီသော လူနေမှုဘဝများနှင့် နေထိုင်နေကြသည့် မြန်မာပြည်သူပြည်သားများအတွက် ကြုံတွေ့လာနိုင်သောအန္တရာယ်များကို ပြောင်းလဲမှုအလိုက် အစဉ်အမြဲလေ့လာပြီး သင့်တော်မှန်ကန်သောအာမခံအမျိုးအစားကိုသာ အရိုးသားဆုံးအကြံပေးကာ ဝန်ဆောင်မှု ပေးသွားမည် ဖြစ်ပါသည်။',
      },
      {
        id: 'asp-3',
        paragraph: 'ဖြတ်သန်းရမည့် ဘဝအတွက် လုံခြုံစိတ်ချစွာ နှင့်မှန်ကန်သော ဆုံးဖြတ်ချက် ချမှတ်နိုင်ရန်ရည်ရွယ်ပြီး အဆုံးစွန်အထိကူညီပေးသွားရန် စိတ်အားထက်သန်လျက်ရှိပါသည်။',
      },
      {
        id: 'asp-4',
        paragraph: 'KBZ Life Insurance အနေဖြင့် လူတိုင်းအတွက် လိုအပ်သော ကာကွယ်မှုများကို လုံခြုံပြီး စိတ်ချရသော အရိပ်အမြုံအဖြစ် အေးအတူပူအမျှ ရှိနေပေးမည် ဖြစ်ပါသည်။',
      },
    ],
  },
  contact: {
    email: 'info@kbzlife.com',
    phone: '(+95) 9954477788',
    website: 'https://kbzlife.com',
    addresses: [
      {
        city: 'Yangon (Head Office)',
        address: 'No.C520/A-5, Pyae Wa Condominium, Kabar Aye Pagoda Road, Bahan Township, Yangon.',
      },
      {
        city: 'Mandalay Branch',
        address: 'No.A(5+6), 33 Street , Between (77*78) Street, Chanayethazan Township, Mandalay.',
      },
      {
        city: 'Taunggyi Branch',
        address: 'Room A - 10, Shop House Unit A, Small Highway Station, Taunggyi-Hopong Road, Taunggyi.',
      },
    ],
    socialLinks: [
      { name: 'Facebook', url: 'https://facebook.com/kbzlife' },
      { name: 'LinkedIn', url: 'https://linkedin.com/company/kbzlife' },
      { name: 'TikTok', url: 'https://tiktok.com/@kbzlife' },
      { name: 'YouTube', url: 'https://youtube.com/@kbzlife' },
    ],
  },
};

export const samplePreviewCompanyContent: CompanyContentData = {
  ...defaultCompanyContent,
  hero: {
    ...defaultCompanyContent.hero,
    imageUrl: '/assets/aistudio/6-2-1024x683_b78785ee.jpg',
  },
  about: {
    ...defaultCompanyContent.about,
    imageUrl: '/assets/aistudio/KBZL_cb546615.png',
  },
};
