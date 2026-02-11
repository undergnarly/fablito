export type Language = 'en' | 'ru' | 'kz'

export interface Translations {
  // Header
  home: string
  stories: string
  favorites: string
  admin: string
  
  // Main page
  heroTitle: string
  heroSubtitle: string
  createStoryButton: string
  howItWorksTitle: string
  howItWorksSubtitle: string
  howItWorksStep1Title: string
  howItWorksStep1Desc: string
  howItWorksStep2Title: string
  howItWorksStep2Desc: string
  howItWorksStep3Title: string
  howItWorksStep3Desc: string
  
  // Story creation
  createStoryTitle: string
  createStoryDescription: string
  latestStoriesTitle: string
  noStoriesYet: string
  createFirstStory: string
  
  // Create story form
  storyTitle: string
  storyTitlePlaceholder: string
  heroName: string
  heroNamePlaceholder: string
  childAge: string
  childAgeYears: string
  childAgeRange: string
  childGender: string
  boy: string
  girl: string
  pageCount: string
  characterPhoto: string
  characterPhotoDesc: string
  imageFormats: string
  backToStories: string
  heroPhoto: string
  heroPhotoOptional: string
  clickToUpload: string
  photoUploaded: string
  uploadPhoto: string
  storyTheme: string
  storyThemePlaceholder: string
  selectStylePlaceholder: string
  storyLanguage: string
  selectLanguagePlaceholder: string
  illustrationStyle: string
  selectStyle: string
  
  // Style options
  watercolor: string
  cartoon: string
  realistic: string
  fantasy: string
  minimalist: string
  anime: string
  handdrawn: string

  // Image quality
  imageQuality: string
  standardQuality: string
  premiumQuality: string
  coinsPerPage: string
  fasterGeneration: string
  betterDetails: string

  // Theme options
  selectThemePlaceholder: string
  relationshipsFriendship: string
  characterCourage: string
  responsibility: string
  familyCare: string
  natureWorld: string
  learningDevelopment: string
  emotionsInnerWorld: string
  
  addOwnStory: string
  addOwnStoryOptional: string
  writeAsText: string
  writeAsTextDesc: string
  recordWithVoice: string
  recordWithVoiceDesc: string
  yourStory: string
  yourStoryPlaceholder: string
  charactersCount: string
  voiceRecording: string
  audioRecorded: string
  delete: string
  reRecord: string
  startRecording: string
  stopRecording: string
  tellYourStory: string
  clickToStartRecording: string
  privateStory: string
  privateStoryDesc: string
  createStory: string
  creatingStory: string
  
  // Generation page
  preparingStory: string
  writingStory: string
  drawingIllustrations: string
  storyReady: string
  somethingWentWrong: string
  creatingYourStory: string
  generationTakesTime: string
  viewStoryInProgress: string
  storyStillGenerating: string
  
  // Errors
  storyTitleRequired: string
  heroNameRequired: string
  storyThemeRequired: string
  ageRange: string
  error: string
  
  // Stories page
  allStories: string
  browseAllStories: string
  searchPlaceholder: string
  backToHome: string
  createNewStory: string
  filter: string
  recent: string
  popular: string
  noStoriesFound: string
  noStoriesYet: string
  createFirstStory: string
  
  // Footer
  footerText: string
  footerDescription: string
  explore: string
  browseStories: string
  createStory: string
  myFavorites: string
  connect: string
  privacyPolicy: string
  termsOfService: string
  
  // Story viewer navigation
  previousPage: string
  nextPage: string
  theEnd: string
  seeMoral: string
  moralOfTheStory: string
  whatWeCanLearn: string
  backToStory: string
  printOrSavePDF: string
  refreshImages: string
  previousPageAria: string
  nextPageAria: string
  endOfStoryAria: string
  
  // Text-to-Speech
  listen: string
  pause: string
  resume: string
  stop: string
  listenFullStory: string
  stopAudio: string
  audioNotSupported: string
  enableAutoPlay: string
  disableAutoPlay: string
  storyMode: string
  normalMode: string
  
  // Authentication
  login: string
  register: string
  logout: string
  signIn: string
  signUp: string
  createAccount: string
  welcomeBack: string
  joinUs: string
  fullName: string
  email: string
  password: string
  confirmPassword: string
  enterFullName: string
  enterEmail: string
  enterPassword: string
  createStrongPassword: string
  confirmYourPassword: string
  creatingAccount: string
  signingIn: string
  alreadyHaveAccount: string
  dontHaveAccount: string
  invalidEmailOrPassword: string
  accountDeactivated: string
  registrationFailed: string
  loginFailed: string
  errorOccurred: string
  nameRequired: string
  emailRequired: string
  passwordRequired: string
  passwordsDoNotMatch: string
  userWithEmailExists: string
  profile: string
  myStories: string
  memberSince: string
  status: string
  active: string
  inactive: string
  personalInformation: string
  accountDetails: string
  manageYourStories: string
  noStoriesYet: string
  startCreating: string
  createYourFirstStory: string
  createNewStory: string
  
  // Common
  back: string
  loading: string
  optional: string
  years: string

  // Coins and subscription
  coins: string
  coinsLabel: string
  buyCoins: string
  buyButton: string
  generationCost: string
  pagesMultiplier: string
  needMoreCoins: string
  insufficientCoins: string
  notEnoughCoins: string
  youHave: string
  needed: string

  // Subscription page
  subscriptionTitle: string
  subscriptionSubtitle: string
  monthlyPlan: string
  monthlyPlanDesc: string
  coinsPerMonth: string
  pagesPerMonth: string
  booksPerMonth: string
  subscribe: string
  subscribing: string
  currentBalance: string
  freeCoinsInfo: string
  welcomeBonus: string
  registrationBonus: string
  perPage: string

  // Starter Pack
  starterPack: string
  starterPackDesc: string
  starterPackPrice: string
  starterPackCoins: string
  starterPackPages: string
  starterPackBooks: string
  buyWithPaypal: string
  paymentPending: string
  paymentInstructions: string

  // Submissions halted
  submissionsHalted: string
  submissionsHaltedDesc: string
  whileYouWait: string
  browseExistingStories: string

  // Voice recording
  microphoneError: string
  microphonePermission: string
  recording: string
  recognizingSpeech: string
  recognizedText: string
  useAsStoryText: string

  // Image upload
  uploadImageFile: string
  imageSizeLimit: string

  // Export
  export: string
  webpageHtml: string
  openInBrowser: string
  pdfForPrint: string
  readyToPrint: string
  ebookEpub: string
  ereaderFormat: string
  exportError: string

  // Search
  noStoriesFoundFor: string
  foundStories: string
  story: string
  storiesPlural: string
  forSearch: string

  // Skip to content
  skipToContent: string

  // Read button
  read: string
  viewAllStories: string

  // Languages
  russian: string
  english: string
  kazakh: string

  // Upsell modal
  notEnoughCoinsTitle: string
  notEnoughCoinsDesc: string
  registerForBonus: string
  getRegistrationBonus: string
  getSubscription: string
  unlimitedStories: string
  inviteFriends: string
  referralDescription: string
  copyLink: string
  linkCopied: string

  // Referral
  referralWelcome: string
  referralBonusInfo: string

  // Privacy
  photoPrivacyNotice: string
}

export const translations: Record<Language, Translations> = {
  en: {
    // Header
    home: 'Home',
    stories: 'Stories',
    favorites: 'Favorites',
    admin: 'Admin',
    
    // Main page
    heroTitle: 'Fablito',
    heroSubtitle: 'Create magical personalized stories for children using AI',
    createStoryButton: 'Create Story',
    howItWorksTitle: 'How It Works',
    howItWorksSubtitle: 'Create personalized stories in just a few simple steps',
    howItWorksStep1Title: 'Enter Your Idea',
    howItWorksStep1Desc: 'Tell us about your child and the story theme',
    howItWorksStep2Title: 'AI Creates Magic',
    howItWorksStep2Desc: 'Our AI generates a personalized story with beautiful illustrations',
    howItWorksStep3Title: 'Read & Share',
    howItWorksStep3Desc: 'Enjoy reading together and share with family and friends',
    
    // Story creation
    createStoryTitle: 'Create Your Story',
    createStoryDescription: 'Tell us your story idea - it can be from your childhood, a made-up adventure, or any tale you\'d like to bring to life!',
    latestStoriesTitle: 'Latest Stories',
    noStoriesYet: 'No Stories Yet',
    createFirstStory: 'Create your first magical story!',
    
    // Create story form
    storyTitle: 'Story Title',
    storyTitlePlaceholder: "Max's Adventure with the Alphabet",
    heroName: "Hero",
    heroNamePlaceholder: "Main character's name",
    childAge: "Child's Age",
    childAgeYears: 'years old',
    childAgeRange: 'years',
    childGender: "Child's Gender",
    boy: 'Boy',
    girl: 'Girl',
    pageCount: 'Number of pages',
    characterPhoto: 'Photo of your child',
    characterPhotoDesc: 'Upload a photo to create a character that looks like your child',
    imageFormats: 'PNG, JPG up to 5MB',
    backToStories: 'Back to Stories',
    heroPhoto: 'Hero Photo',
    heroPhotoOptional: 'optional',
    clickToUpload: 'Click to upload hero photo',
    photoUploaded: 'Photo uploaded',
    uploadPhoto: 'Upload Photo',
    storyTheme: 'Story Theme/Moral',
    storyThemePlaceholder: 'e.g., Friendship and helping each other',
    selectStylePlaceholder: 'Select style',
    storyLanguage: 'Story Language',
    selectLanguagePlaceholder: 'Select language',
    illustrationStyle: 'Illustration Style',
    selectStyle: 'Select style',
    
    // Style options
    watercolor: 'Watercolor',
    cartoon: 'Cartoon',
    realistic: 'Photorealistic',
    fantasy: 'Fantasy',
    minimalist: 'Minimalist',
    anime: 'Anime',
    handdrawn: 'Child Drawing',

    // Image quality
    imageQuality: 'Image Quality',
    standardQuality: 'Standard',
    premiumQuality: 'Premium',
    coinsPerPage: 'coins/page',
    fasterGeneration: 'Faster generation',
    betterDetails: 'Better details',

    // Theme options
    selectThemePlaceholder: 'Select story theme',
    relationshipsFriendship: '👫 Relationships and Friendship',
    characterCourage: '💪 Character and Courage',
    responsibility: '🌱 Responsibility',
    familyCare: '❤️ Family and Care',
    natureWorld: '🌍 Nature and World Around',
    learningDevelopment: '🧠 Learning and Development',
    emotionsInnerWorld: '🎨 Emotions and Inner World',
    
    addOwnStory: 'Add Your Own Story',
    addOwnStoryOptional: 'optional',
    writeAsText: 'Write as Text',
    writeAsTextDesc: 'Write your version of the story',
    recordWithVoice: 'Record with Voice',
    recordWithVoiceDesc: 'Tell the story with your voice',
    yourStory: 'Your Story',
    yourStoryPlaceholder: 'Tell your version of the story here...',
    charactersCount: 'characters',
    voiceRecording: 'Voice Recording',
    audioRecorded: 'Audio recorded',
    delete: 'Delete',
    reRecord: 'Re-record',
    startRecording: 'Start Recording',
    stopRecording: 'Stop Recording',
    tellYourStory: 'Tell your story...',
    clickToStartRecording: 'Click to start recording',
    privateStory: 'Private Story',
    privateStoryDesc: "Private stories don't appear in the public list, but can be shared via link",
    createStory: 'Create Story',
    creatingStory: 'Creating Story...',
    
    // Generation page
    preparingStory: 'Preparing to create your personalized story...',
    writingStory: 'Writing your magical story...',
    drawingIllustrations: 'Drawing illustrations...',
    storyReady: 'Your story is ready!',
    somethingWentWrong: 'Oops! Something went wrong.',
    creatingYourStory: 'Creating your personalized story...',
    generationTakesTime: 'This may take a minute or two. Our AI is hard at work creating a special story just for you!',
    viewStoryInProgress: 'View Story in Progress',
    storyStillGenerating: 'You can view the story while images are still being generated',
    
    // Errors
    storyTitleRequired: 'Story title is required',
    heroNameRequired: "Hero name is required",
    storyThemeRequired: 'Story theme/moral is required',
    ageRange: 'Age must be between 2 and 12 years',
    error: 'Error',
    
    // Stories page
    allStories: 'All Stories',
    browseAllStories: 'Browse all the magical Fablito stories',
    searchPlaceholder: 'Search stories...',
    backToHome: 'Back to Home',
    createNewStory: 'Create New Story',
    filter: 'Filter',
    recent: 'Recent',
    popular: 'Popular',
    noStoriesFound: 'No stories found',
    noStoriesYet: 'No Stories Yet',
    createFirstStory: 'Create your first magical story!',
    
    // Footer
    footerText: 'Built with ❤️ for creating magical stories',
    footerDescription: 'Creating magical personalized childhood stories and fairy tales for children using AI. Designed to make learning fun and interactive.',
    explore: 'Explore',
    browseStories: 'Browse Stories',
    createStory: 'Create Story',
    myFavorites: 'My Favorites',
    connect: 'Connect',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    
    // Story viewer navigation
    previousPage: 'Previous Page',
    nextPage: 'Next Page',
    theEnd: 'The End',
    seeMoral: 'See Moral',
    moralOfTheStory: 'The Moral of the Story',
    whatWeCanLearn: 'What we can learn from',
    backToStory: 'Back to Story',
    printOrSavePDF: 'Print or save as PDF',
    refreshImages: 'Refresh images',
    previousPageAria: 'Previous page',
    nextPageAria: 'Next page',
    endOfStoryAria: 'End of story',
    
    // Text-to-Speech
    listen: 'Listen',
    pause: 'Pause',
    resume: 'Resume',
    stop: 'Stop',
    listenFullStory: 'Listen to full story',
    stopAudio: 'Stop audio',
    audioNotSupported: 'Audio playback is not supported in your browser',
    enableAutoPlay: 'Enable auto-play',
    disableAutoPlay: 'Disable auto-play',
    storyMode: 'Story mode',
    normalMode: 'Normal mode',
    
    // Authentication
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    createAccount: 'Create Account',
    welcomeBack: 'Welcome Back',
    joinUs: 'Join us to create personalized stories for your child',
    fullName: 'Full Name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    enterFullName: 'Enter your full name',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    createStrongPassword: 'Create a strong password',
    confirmYourPassword: 'Confirm your password',
    creatingAccount: 'Creating Account...',
    signingIn: 'Signing In...',
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    invalidEmailOrPassword: 'Invalid email or password',
    accountDeactivated: 'Account is deactivated',
    registrationFailed: 'Registration failed',
    loginFailed: 'Login failed',
    errorOccurred: 'An error occurred during',
    nameRequired: 'Name is required',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    passwordsDoNotMatch: 'Passwords do not match',
    userWithEmailExists: 'User with this email already exists',
    profile: 'Profile',
    myStories: 'My Stories',
    memberSince: 'Member since',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    personalInformation: 'Personal Information',
    accountDetails: 'Your account details and preferences',
    manageYourStories: 'Manage your created stories',
    noStoriesYet: 'No stories yet',
    startCreating: 'Start creating magical stories for your child',
    createYourFirstStory: 'Create Your First Story',
    createNewStory: 'Create New Story',
    
    // Common
    back: 'Back',
    loading: 'Loading...',
    optional: 'optional',
    years: 'years',

    // Coins and subscription
    coins: 'coins',
    coinsLabel: 'coins',
    buyCoins: 'Buy Coins',
    buyButton: 'Buy',
    generationCost: 'Cost',
    pagesMultiplier: 'pages × 10 coins',
    needMoreCoins: 'Need more',
    insufficientCoins: 'Insufficient coins',
    notEnoughCoins: 'Not enough coins. You need',
    youHave: 'you have',
    needed: 'needed',

    // Subscription page
    subscriptionTitle: 'Get More Coins',
    subscriptionSubtitle: 'Create unlimited magical stories for your children',
    monthlyPlan: 'Monthly Plan',
    monthlyPlanDesc: 'Create up to 30 illustrated stories per month',
    coinsPerMonth: 'coins per month',
    pagesPerMonth: 'pages per month',
    booksPerMonth: 'books per month',
    subscribe: 'Subscribe for $9.99/month',
    subscribing: 'Processing...',
    currentBalance: 'Current Balance',
    freeCoinsInfo: 'Get free coins to start',
    welcomeBonus: 'Welcome bonus',
    registrationBonus: 'Registration bonus',
    perPage: 'per page',

    // Starter Pack
    starterPack: 'Starter Pack',
    starterPackDesc: '500 coins — create ~5 stories with illustrations',
    starterPackPrice: '$5',
    starterPackCoins: 'coins',
    starterPackPages: 'pages',
    starterPackBooks: 'books',
    buyWithPaypal: 'Buy with PayPal',
    paymentPending: 'After payment, coins will be credited within 24 hours',
    paymentInstructions: 'Please include your email or username in the PayPal payment note so we can identify your account',

    // Submissions halted
    submissionsHalted: 'Submissions Temporarily Halted',
    submissionsHaltedDesc: 'Due to high demand, we\'ve temporarily paused new story submissions. Please check back later!',
    whileYouWait: 'While you wait...',
    browseExistingStories: 'You can still browse and enjoy existing stories in our library!',

    // Voice recording
    microphoneError: 'Microphone access error',
    microphonePermission: 'Could not access microphone. Please check permissions.',
    recording: 'Recording...',
    recognizingSpeech: 'Recognizing speech...',
    recognizedText: 'Recognized text',
    useAsStoryText: 'Use as story text',

    // Image upload
    uploadImageFile: 'Please upload an image file',
    imageSizeLimit: 'Image size should be less than 5MB',

    // Export
    export: 'Export',
    webpageHtml: 'Webpage (HTML)',
    openInBrowser: 'Open in browser',
    pdfForPrint: 'PDF for print',
    readyToPrint: 'Ready to print',
    ebookEpub: 'E-book (EPUB)',
    ereaderFormat: 'E-reader format',
    exportError: 'Export error',

    // Search
    noStoriesFoundFor: 'No stories found for',
    foundStories: 'Found',
    story: 'story',
    storiesPlural: 'stories',
    forSearch: 'for',

    // Skip to content
    skipToContent: 'Skip to main content',

    // Read button
    read: 'Read',
    viewAllStories: 'View All Stories',

    // Languages
    russian: 'Russian',
    english: 'English',
    kazakh: 'Kazakh',

    // Upsell modal
    notEnoughCoinsTitle: 'Not Enough Coins',
    notEnoughCoinsDesc: 'You need more coins to create this story. Here\'s how to get them:',
    registerForBonus: 'Register for free',
    getRegistrationBonus: 'Get +50 bonus coins',
    getSubscription: 'Get a subscription',
    unlimitedStories: 'Create unlimited stories',
    inviteFriends: 'Invite friends',
    referralDescription: 'Get 100 coins for each friend who registers with your link!',
    copyLink: 'Copy link',
    linkCopied: 'Link copied!',

    // Referral
    referralWelcome: 'You\'ve been invited!',
    referralBonusInfo: 'Register now and get bonus coins!',

    // Privacy
    photoPrivacyNotice: 'All photos are stored privately and securely. No one has access to them.'
  },

  ru: {
    // Header
    home: 'Главная',
    stories: 'Истории',
    favorites: 'Избранное',
    admin: 'Админ',
    
    // Main page
    heroTitle: 'Fablito',
    heroSubtitle: 'Создавайте волшебные персонализированные истории для детей с помощью ИИ',
    createStoryButton: 'Создать Историю',
    howItWorksTitle: 'Как Это Работает',
    howItWorksSubtitle: 'Создавайте персонализированные истории всего за несколько простых шагов',
    howItWorksStep1Title: 'Введите Вашу Идею',
    howItWorksStep1Desc: 'Расскажите нам о вашем ребёнке и теме истории',
    howItWorksStep2Title: 'ИИ Создаёт Магию',
    howItWorksStep2Desc: 'Наш ИИ генерирует персонализированную историю с красивыми иллюстрациями',
    howItWorksStep3Title: 'Читайте и Делитесь',
    howItWorksStep3Desc: 'Наслаждайтесь чтением вместе и делитесь с семьёй и друзьями',
    
    // Story creation
    createStoryTitle: 'Создайте Свою Историю',
    createStoryDescription: 'Расскажите нам вашу идею истории - это может быть история из вашего детства, выдуманное приключение или любая сказка, которую вы хотите оживить!',
    latestStoriesTitle: 'Последние Истории',
    noStoriesYet: 'Пока Нет Историй',
    createFirstStory: 'Создайте свою первую волшебную историю!',
    
    // Create story form
    storyTitle: 'Название Истории',
    storyTitlePlaceholder: 'Приключения Макса с алфавитом',
    heroName: 'Герой',
    heroNamePlaceholder: 'Имя главного героя',
    childAge: 'Возраст Ребёнка',
    childAgeYears: 'лет',
    childAgeRange: 'года',
    childGender: 'Пол ребёнка',
    boy: 'Мальчик',
    girl: 'Девочка',
    pageCount: 'Количество страниц',
    characterPhoto: 'Фото ребёнка',
    characterPhotoDesc: 'Загрузите фото, чтобы создать персонажа, похожего на вашего ребёнка',
    imageFormats: 'PNG, JPG до 5МБ',
    backToStories: 'Назад к историям',
    heroPhoto: 'Фото Героя',
    heroPhotoOptional: 'необязательно',
    clickToUpload: 'Нажмите для загрузки фото героя',
    photoUploaded: 'Фото загружено',
    uploadPhoto: 'Загрузить Фото',
    storyTheme: 'Тема/Мораль Сказки',
    storyThemePlaceholder: 'например, Дружба и взаимопомощь',
    selectStylePlaceholder: 'Выберите стиль',
    storyLanguage: 'Язык Истории',
    selectLanguagePlaceholder: 'Выберите язык',
    illustrationStyle: 'Стиль Иллюстраций',
    selectStyle: 'Выберите стиль',
    
    // Style options
    watercolor: 'Акварель',
    cartoon: 'Мультяшный',
    realistic: 'Фотореализм',
    fantasy: 'Фэнтези',
    minimalist: 'Минималистичный',
    anime: 'Аниме',
    handdrawn: 'Детский рисунок',

    // Image quality
    imageQuality: 'Качество изображений',
    standardQuality: 'Стандарт',
    premiumQuality: 'Премиум',
    coinsPerPage: 'монет/стр.',
    fasterGeneration: 'Быстрее',
    betterDetails: 'Лучше детали',

    // Theme options
    selectThemePlaceholder: 'Выберите тему сказки',
    relationshipsFriendship: '👫 Отношения и дружба',
    characterCourage: '💪 Характер и смелость',
    responsibility: '🌱 Ответственность',
    familyCare: '❤️ Семья и забота',
    natureWorld: '🌍 Природа и мир вокруг',
    learningDevelopment: '🧠 Учёба и развитие',
    emotionsInnerWorld: '🎨 Эмоции и внутренний мир',
    
    addOwnStory: 'Добавить Свою Историю',
    addOwnStoryOptional: 'необязательно',
    writeAsText: 'Написать Текстом',
    writeAsTextDesc: 'Напишите свою версию истории',
    recordWithVoice: 'Записать Голосом',
    recordWithVoiceDesc: 'Расскажите историю своим голосом',
    yourStory: 'Ваша История',
    yourStoryPlaceholder: 'Расскажите свою версию истории здесь...',
    charactersCount: 'символов',
    voiceRecording: 'Голосовая Запись',
    audioRecorded: 'Аудио записано',
    delete: 'Удалить',
    reRecord: 'Перезаписать',
    startRecording: 'Начать Запись',
    stopRecording: 'Остановить Запись',
    tellYourStory: 'Рассказывайте историю...',
    clickToStartRecording: 'Нажмите для начала записи',
    privateStory: 'Приватная История',
    privateStoryDesc: 'Приватные истории не появляются в общем списке, но ими можно поделиться по ссылке',
    createStory: 'Создать Историю',
    creatingStory: 'Создание Истории...',
    
    // Generation page
    preparingStory: 'Подготавливаем создание вашей персональной истории...',
    writingStory: 'Пишем вашу волшебную историю...',
    drawingIllustrations: 'Рисуем иллюстрации...',
    storyReady: 'Ваша история готова!',
    somethingWentWrong: 'Ой! Что-то пошло не так.',
    creatingYourStory: 'Создаём вашу персональную историю...',
    generationTakesTime: 'Это может занять минуту или две. Наш ИИ усердно работает, создавая особую историю именно для вас!',
    viewStoryInProgress: 'Смотреть Историю в Процессе',
    storyStillGenerating: 'Вы можете просмотреть историю, пока иллюстрации ещё генерируются',
    
    // Errors
    storyTitleRequired: 'Название истории обязательно',
    heroNameRequired: 'Имя героя обязательно',
    storyThemeRequired: 'Тема/мораль сказки обязательна',
    ageRange: 'Возраст должен быть от 2 до 12 лет',
    error: 'Ошибка',
    
    // Stories page
    allStories: 'Все Истории',
    browseAllStories: 'Просматривайте все волшебные истории Fablito',
    searchPlaceholder: 'Поиск историй...',
    backToHome: 'Назад на Главную',
    createNewStory: 'Создать Новую Историю',
    filter: 'Фильтр',
    recent: 'Недавние',
    popular: 'Популярные',
    noStoriesFound: 'Истории не найдены',
    noStoriesYet: 'Пока Нет Историй',
    createFirstStory: 'Создайте свою первую волшебную историю!',
    
    // Footer
    footerText: 'Создано с ❤️ для создания волшебных историй',
    footerDescription: 'Создаём волшебные персонализированные сказки из детства для детей с помощью ИИ. Разработано для того, чтобы обучение было весёлым и интерактивным.',
    explore: 'Обзор',
    browseStories: 'Просмотр Историй',
    createStory: 'Создать Историю',
    myFavorites: 'Мои Избранные',
    connect: 'Связаться',
    privacyPolicy: 'Политика Конфиденциальности',
    termsOfService: 'Условия Использования',
    
    // Story viewer navigation
    previousPage: 'Предыдущая Страница',
    nextPage: 'Следующая Страница',
    theEnd: 'Конец',
    seeMoral: 'Посмотреть Мораль',
    moralOfTheStory: 'Мораль Сказки',
    whatWeCanLearn: 'Чему мы можем научиться из',
    backToStory: 'Назад к Сказке',
    printOrSavePDF: 'Печать или сохранение в PDF',
    refreshImages: 'Обновить изображения',
    previousPageAria: 'Предыдущая страница',
    nextPageAria: 'Следующая страница',
    endOfStoryAria: 'Конец истории',
    
    // Text-to-Speech
    listen: 'Слушать',
    pause: 'Пауза',
    resume: 'Продолжить',
    stop: 'Стоп',
    listenFullStory: 'Слушать всю историю',
    stopAudio: 'Остановить аудио',
    audioNotSupported: 'Аудио воспроизведение не поддерживается в вашем браузере',
    enableAutoPlay: 'Включить автовоспроизведение',
    disableAutoPlay: 'Отключить автовоспроизведение',
    storyMode: 'Режим сказки',
    normalMode: 'Обычный режим',
    
    // Authentication
    login: 'Войти',
    register: 'Регистрация',
    logout: 'Выход',
    signIn: 'Войти',
    signUp: 'Зарегистрироваться',
    createAccount: 'Создать аккаунт',
    welcomeBack: 'Добро пожаловать',
    joinUs: 'Присоединяйтесь к нам, чтобы создавать персональные истории для вашего ребенка',
    fullName: 'Полное имя',
    email: 'Электронная почта',
    password: 'Пароль',
    confirmPassword: 'Подтвердите пароль',
    enterFullName: 'Введите ваше полное имя',
    enterEmail: 'Введите вашу электронную почту',
    enterPassword: 'Введите ваш пароль',
    createStrongPassword: 'Создайте надежный пароль',
    confirmYourPassword: 'Подтвердите ваш пароль',
    creatingAccount: 'Создание аккаунта...',
    signingIn: 'Вход в систему...',
    alreadyHaveAccount: 'Уже есть аккаунт?',
    dontHaveAccount: 'Нет аккаунта?',
    invalidEmailOrPassword: 'Неверный email или пароль',
    accountDeactivated: 'Аккаунт деактивирован',
    registrationFailed: 'Ошибка регистрации',
    loginFailed: 'Ошибка входа',
    errorOccurred: 'Произошла ошибка во время',
    nameRequired: 'Имя обязательно',
    emailRequired: 'Email обязателен',
    passwordRequired: 'Пароль обязателен',
    passwordsDoNotMatch: 'Пароли не совпадают',
    userWithEmailExists: 'Пользователь с таким email уже существует',
    profile: 'Профиль',
    myStories: 'Мои истории',
    memberSince: 'Участник с',
    status: 'Статус',
    active: 'Активен',
    inactive: 'Неактивен',
    personalInformation: 'Личная информация',
    accountDetails: 'Детали вашего аккаунта и настройки',
    manageYourStories: 'Управляйте созданными историями',
    noStoriesYet: 'Пока нет историй',
    startCreating: 'Начните создавать волшебные истории для вашего ребенка',
    createYourFirstStory: 'Создайте свою первую историю',
    createNewStory: 'Создать новую историю',
    
    // Common
    back: 'Назад',
    loading: 'Загрузка...',
    optional: 'необязательно',
    years: 'лет',

    // Coins and subscription
    coins: 'монеток',
    coinsLabel: 'монеток',
    buyCoins: 'Купить монетки',
    buyButton: 'Купить',
    generationCost: 'Стоимость',
    pagesMultiplier: 'страниц × 10 монеток',
    needMoreCoins: 'Нужно ещё',
    insufficientCoins: 'Недостаточно монеток',
    notEnoughCoins: 'Недостаточно монеток. Нужно',
    youHave: 'у вас',
    needed: 'нужно',

    // Subscription page
    subscriptionTitle: 'Получить больше монеток',
    subscriptionSubtitle: 'Создавайте неограниченное количество волшебных историй для ваших детей',
    monthlyPlan: 'Месячный план',
    monthlyPlanDesc: 'Создавайте до 30 иллюстрированных историй в месяц',
    coinsPerMonth: 'монеток в месяц',
    pagesPerMonth: 'страниц в месяц',
    booksPerMonth: 'книг в месяц',
    subscribe: 'Подписаться за $9.99/месяц',
    subscribing: 'Обработка...',
    currentBalance: 'Текущий баланс',
    freeCoinsInfo: 'Получите бесплатные монетки для начала',
    welcomeBonus: 'Приветственный бонус',
    registrationBonus: 'Бонус за регистрацию',
    perPage: 'за страницу',

    // Starter Pack
    starterPack: 'Стартовый пакет',
    starterPackDesc: '500 монеток — создайте ~5 историй с иллюстрациями',
    starterPackPrice: '$5',
    starterPackCoins: 'монеток',
    starterPackPages: 'страниц',
    starterPackBooks: 'книг',
    buyWithPaypal: 'Купить через PayPal',
    paymentPending: 'После оплаты монетки будут начислены в течение 24 часов',
    paymentInstructions: 'Укажите ваш email или имя пользователя в примечании к платежу PayPal, чтобы мы могли идентифицировать ваш аккаунт',

    // Submissions halted
    submissionsHalted: 'Создание историй временно приостановлено',
    submissionsHaltedDesc: 'Из-за высокой нагрузки мы временно приостановили создание новых историй. Пожалуйста, попробуйте позже!',
    whileYouWait: 'Пока вы ждёте...',
    browseExistingStories: 'Вы можете просматривать существующие истории в нашей библиотеке!',

    // Voice recording
    microphoneError: 'Ошибка доступа к микрофону',
    microphonePermission: 'Не удалось получить доступ к микрофону. Проверьте разрешения.',
    recording: 'Запись...',
    recognizingSpeech: 'Распознавание речи...',
    recognizedText: 'Распознанный текст',
    useAsStoryText: 'Использовать как текст истории',

    // Image upload
    uploadImageFile: 'Пожалуйста, загрузите изображение',
    imageSizeLimit: 'Размер изображения должен быть меньше 5МБ',

    // Export
    export: 'Экспорт',
    webpageHtml: 'Веб-страница (HTML)',
    openInBrowser: 'Открыть в браузере',
    pdfForPrint: 'PDF для печати',
    readyToPrint: 'Готово к печати',
    ebookEpub: 'Электронная книга (EPUB)',
    ereaderFormat: 'Формат для e-reader',
    exportError: 'Ошибка при экспорте',

    // Search
    noStoriesFoundFor: 'Истории не найдены для',
    foundStories: 'Найдено',
    story: 'история',
    storiesPlural: 'историй',
    forSearch: 'для',

    // Skip to content
    skipToContent: 'Перейти к содержимому',

    // Read button
    read: 'Читать',
    viewAllStories: 'Смотреть все истории',

    // Languages
    russian: 'Русский',
    english: 'English',
    kazakh: 'Қазақша',

    // Upsell modal
    notEnoughCoinsTitle: 'Недостаточно монеток',
    notEnoughCoinsDesc: 'Вам нужно больше монеток для создания истории. Вот как их получить:',
    registerForBonus: 'Зарегистрируйтесь бесплатно',
    getRegistrationBonus: 'Получите +50 бонусных монеток',
    getSubscription: 'Оформить подписку',
    unlimitedStories: 'Создавайте неограниченное количество историй',
    inviteFriends: 'Пригласите друзей',
    referralDescription: 'Получите 100 монеток за каждого друга, который зарегистрируется по вашей ссылке!',
    copyLink: 'Копировать ссылку',
    linkCopied: 'Ссылка скопирована!',

    // Referral
    referralWelcome: 'Вас пригласили!',
    referralBonusInfo: 'Зарегистрируйтесь и получите бонусные монетки!',

    // Privacy
    photoPrivacyNotice: 'Все фото хранятся приватно и безопасно. Никто не имеет к ним доступа.'
  },

  kz: {
    // Header
    home: 'Басты бет',
    stories: 'Ертегілер',
    favorites: 'Таңдаулылар',
    admin: 'Админ',
    
    // Main page
    heroTitle: 'Fablito',
    heroSubtitle: 'Балаларға арналған жасанды интеллект арқылы сиқырлы дербес ертегілер жасаңыз',
    createStoryButton: 'Ертегі Жасау',
    howItWorksTitle: 'Қалай Жұмыс Істейді',
    howItWorksSubtitle: 'Бірнеше қарапайым қадамда жекелендірілген ертегілер жасаңыз',
    howItWorksStep1Title: 'Идеяңызды Енгізіңіз',
    howItWorksStep1Desc: 'Балаңыз туралы және ертегі тақырыбы туралы айтыңыз',
    howItWorksStep2Title: 'ЖИ Сихыр Жасайды',
    howItWorksStep2Desc: 'Біздің ЖИ әдемі суреттермен дербес ертегі жасайды',
    howItWorksStep3Title: 'Оқыңыз және Бөлісіңіз',
    howItWorksStep3Desc: 'Бірге оқудан ләззат алыңыз және отбасы мен достарға бөлісіңіз',
    
    // Story creation
    createStoryTitle: 'Өз Ертегіңізді Жасаңыз',
    createStoryDescription: 'Ертегі идеяңызды айтыңыз - бұл балалық шағыңыздан ертегі, ойдан шығарылған приключение немесе өмірге келтіргіңіз келетін кез келген ертегі болуы мүмкін!',
    latestStoriesTitle: 'Соңғы Ертегілер',
    noStoriesYet: 'Әлі Ертегілер Жоқ',
    createFirstStory: 'Алғашқы сиқырлы ертегіңізді жасаңыз!',
    
    // Create story form
    storyTitle: 'Ертегі Атауы',
    storyTitlePlaceholder: 'Максың әліппемен приключениялары',
    heroName: 'Батыр',
    heroNamePlaceholder: 'Басты кейіпкердің есімі',
    childAge: 'Бала Жасы',
    childAgeYears: 'жаста',
    childAgeRange: 'жас',
    childGender: 'Баланың жынысы',
    boy: 'Ұл',
    girl: 'Қыз',
    pageCount: 'Беттер саны',
    characterPhoto: 'Баланың суреті',
    characterPhotoDesc: 'Балаңызға ұқсас кейіпкер жасау үшін сурет жүктеңіз',
    imageFormats: 'PNG, JPG 5МБ дейін',
    backToStories: 'Ертегілерге оралу',
    heroPhoto: 'Батыр Суреті',
    heroPhotoOptional: 'міндетті емес',
    clickToUpload: 'Батыр суретін жүктеу үшін басыңыз',
    photoUploaded: 'Сурет жүктелді',
    uploadPhoto: 'Сурет Жүктеу',
    storyTheme: 'Ертегі Тақырыбы/Моралі',
    storyThemePlaceholder: 'мысалы, Достық және бір-біріне көмектесу',
    selectStylePlaceholder: 'Стиль таңдаңыз',
    storyLanguage: 'Ертегі Тілі',
    selectLanguagePlaceholder: 'Тіл таңдаңыз',
    illustrationStyle: 'Иллюстрация Стилі',
    selectStyle: 'Стиль таңдаңыз',
    
    // Style options
    watercolor: 'Сулы бояу',
    cartoon: 'Мультфильм',
    realistic: 'Фотореалистік',
    fantasy: 'Фантазия',
    minimalist: 'Минималистік',
    anime: 'Аниме',
    handdrawn: 'Балалар суреті',

    // Image quality
    imageQuality: 'Сурет сапасы',
    standardQuality: 'Стандарт',
    premiumQuality: 'Премиум',
    coinsPerPage: 'тиын/бет',
    fasterGeneration: 'Жылдам',
    betterDetails: 'Жақсы детальдар',

    // Theme options
    selectThemePlaceholder: 'Ертегі тақырыбын таңдаңыз',
    relationshipsFriendship: '👫 Қарым-қатынас пен достық',
    characterCourage: '💪 Мінез және батылдық',
    responsibility: '🌱 Жауапкершілік',
    familyCare: '❤️ Отбасы және қамқорлық',
    natureWorld: '🌍 Табиғат және қоршаған әлем',
    learningDevelopment: '🧠 Оқу және даму',
    emotionsInnerWorld: '🎨 Эмоциялар және ішкі әлем',
    
    addOwnStory: 'Өз Ертегіңізді Қосыңыз',
    addOwnStoryOptional: 'міндетті емес',
    writeAsText: 'Мәтін Түрінде Жазу',
    writeAsTextDesc: 'Ертегінің өз нұсқаңызды жазыңыз',
    recordWithVoice: 'Дауыспен Жазу',
    recordWithVoiceDesc: 'Ертегіді өз дауысыңызбен айтыңыз',
    yourStory: 'Сіздің Ертегіңіз',
    yourStoryPlaceholder: 'Ертегінің өз нұсқаңызды осында айтыңыз...',
    charactersCount: 'таңба',
    voiceRecording: 'Дауыс Жазбасы',
    audioRecorded: 'Аудио жазылды',
    delete: 'Жою',
    reRecord: 'Қайта Жазу',
    startRecording: 'Жазуды Бастау',
    stopRecording: 'Жазуды Тоқтату',
    tellYourStory: 'Ертегіңізді айтыңыз...',
    clickToStartRecording: 'Жазуды бастау үшін басыңыз',
    privateStory: 'Жеке Ертегі',
    privateStoryDesc: 'Жеке ертегілер жалпы тізімде көрінбейді, бірақ сілтеме арқылы бөлісуге болады',
    createStory: 'Ертегі Жасау',
    creatingStory: 'Ертегі Жасалуда...',
    
    // Generation page
    preparingStory: 'Сіздің жеке ертегіңізді жасауға дайындалуда...',
    writingStory: 'Сіздің сиқырлы ертегіңізді жазуда...',
    drawingIllustrations: 'Иллюстрациялар салынуда...',
    storyReady: 'Сіздің ертегіңіз дайын!',
    somethingWentWrong: 'Ой! Бірдеңе дұрыс болмады.',
    creatingYourStory: 'Сіздің жеке ертегіңізді жасауда...',
    generationTakesTime: 'Бұл бір-екі минут уақыт алуы мүмкін. Біздің ЖИ дәл сіз үшін ерекше ертегі жасауда тырысып жұмыс істеп тұр!',
    viewStoryInProgress: 'Процестегі Ертегіні Көру',
    storyStillGenerating: 'Иллюстрациялар әлі генерацияланып жатқанда ертегіні көре аласыз',
    
    // Errors
    storyTitleRequired: 'Ертегі атауы міндетті',
    heroNameRequired: 'Батыр есімі міндетті',
    storyThemeRequired: 'Ертегі тақырыбы/моралі міндетті',
    ageRange: 'Жас 2 мен 12 арасында болуы керек',
    error: 'Қате',
    
    // Stories page
    allStories: 'Барлық Ертегілер',
    browseAllStories: 'Fablito-ның барлық сиқырлы ертегілерін қараңыз',
    searchPlaceholder: 'Ертегілерді іздеу...',
    backToHome: 'Басты Бетке Қайту',
    createNewStory: 'Жаңа Ертегі Жасау',
    filter: 'Сүзгі',
    recent: 'Жақында',
    popular: 'Танымал',
    noStoriesFound: 'Ертегілер табылмады',
    noStoriesYet: 'Әлі Ертегілер Жоқ',
    createFirstStory: 'Алғашқы сиқырлы ертегіңізді жасаңыз!',
    
    // Footer
    footerText: 'Сиқырлы ертегілер жасау үшін ❤️ арқылы жасалған',
    footerDescription: 'Балаларға арналған ЖИ арқылы сиқырлы жекелендірілген балалық шақ ертегілерін жасаймыз. Оқытуды қызықты және интерактивті ету үшін жасалған.',
    explore: 'Зерттеу',
    browseStories: 'Ертегілерді Қарау',
    createStory: 'Ертегі Жасау',
    myFavorites: 'Менің Таңдаулыларым',
    connect: 'Байланыс',
    privacyPolicy: 'Құпиялылық Саясаты',
    termsOfService: 'Қызмет Шарттары',
    
    // Story viewer navigation
    previousPage: 'Алдыңғы Бет',
    nextPage: 'Келесі Бет',
    theEnd: 'Соңы',
    seeMoral: 'Моральды Көру',
    moralOfTheStory: 'Ертегінің Моралі',
    whatWeCanLearn: 'Біз не үйренуіміз керек',
    backToStory: 'Ертегіге Қайту',
    printOrSavePDF: 'Басып шығару немесе PDF ретінде сақтау',
    refreshImages: 'Суреттерді жаңарту',
    previousPageAria: 'Алдыңғы бет',
    nextPageAria: 'Келесі бет',
    endOfStoryAria: 'Ертегінің соңы',
    
    // Text-to-Speech
    listen: 'Тыңдау',
    pause: 'Кідірту',
    resume: 'Жалғастыру',
    stop: 'Тоқтату',
    listenFullStory: 'Толық әңгімені тыңдау',
    stopAudio: 'Аудионы тоқтату',
    audioNotSupported: 'Сіздің браузеріңізде аудио ойнату қолдау көрсетілмейді',
    enableAutoPlay: 'Автоойнатуды қосу',
    disableAutoPlay: 'Автоойнатуды өшіру',
    storyMode: 'Ертегі режимі',
    normalMode: 'Қалыпты режим',
    
    // Authentication
    login: 'Кіру',
    register: 'Тіркелу',
    logout: 'Шығу',
    signIn: 'Кіру',
    signUp: 'Тіркелу',
    createAccount: 'Тіркелгі жасау',
    welcomeBack: 'Қош келдіңіз',
    joinUs: 'Балаңызға арналған жеке әңгімелер жасау үшін бізге қосылыңыз',
    fullName: 'Толық аты',
    email: 'Электрондық пошта',
    password: 'Құпия сөз',
    confirmPassword: 'Құпия сөзді растау',
    enterFullName: 'Толық атыңызды енгізіңіз',
    enterEmail: 'Электрондық поштаңызды енгізіңіз',
    enterPassword: 'Құпия сөзіңізді енгізіңіз',
    createStrongPassword: 'Мықты құпия сөз жасаңыз',
    confirmYourPassword: 'Құпия сөзіңізді растаңыз',
    creatingAccount: 'Тіркелгі жасалуда...',
    signingIn: 'Жүйеге кіруде...',
    alreadyHaveAccount: 'Аккаунтыңыз бар ма?',
    dontHaveAccount: 'Аккаунтыңыз жоқ па?',
    invalidEmailOrPassword: 'Дұрыс емес email немесе құпия сөз',
    accountDeactivated: 'Аккаунт өшірілген',
    registrationFailed: 'Тіркелу қатесі',
    loginFailed: 'Кіру қатесі',
    errorOccurred: 'Қате орын алды',
    nameRequired: 'Аты міндетті',
    emailRequired: 'Email міндетті',
    passwordRequired: 'Құпия сөз міндетті',
    passwordsDoNotMatch: 'Құпия сөздер сәйкес келмейді',
    userWithEmailExists: 'Осы email-мен пайдаланушы бар',
    profile: 'Профиль',
    myStories: 'Менің әңгімелерім',
    memberSince: 'Мүше болғаннан бері',
    status: 'Күйі',
    active: 'Белсенді',
    inactive: 'Белсенді емес',
    personalInformation: 'Жеке ақпарат',
    accountDetails: 'Аккаунтыңыздың мәліметтері мен параметрлері',
    manageYourStories: 'Жасалған әңгімелерді басқарыңыз',
    noStoriesYet: 'Әлі әңгімелер жоқ',
    startCreating: 'Балаңызға арналған сиқырлы әңгімелер жасауды бастаңыз',
    createYourFirstStory: 'Алғашқы әңгімеңізді жасаңыз',
    createNewStory: 'Жаңа әңгіме жасау',
    
    // Common
    back: 'Артқа',
    loading: 'Жүктелуде...',
    optional: 'міндетті емес',
    years: 'жас',

    // Coins and subscription
    coins: 'монета',
    coinsLabel: 'монета',
    buyCoins: 'Монета сатып алу',
    buyButton: 'Сатып алу',
    generationCost: 'Құны',
    pagesMultiplier: 'бет × 10 монета',
    needMoreCoins: 'Тағы қажет',
    insufficientCoins: 'Монета жеткіліксіз',
    notEnoughCoins: 'Монета жеткіліксіз. Қажет',
    youHave: 'сізде',
    needed: 'қажет',

    // Subscription page
    subscriptionTitle: 'Көбірек монета алу',
    subscriptionSubtitle: 'Балаларыңызға шексіз сиқырлы әңгімелер жасаңыз',
    monthlyPlan: 'Айлық жоспар',
    monthlyPlanDesc: 'Айына 30-ға дейін суретті әңгіме жасаңыз',
    coinsPerMonth: 'айына монета',
    pagesPerMonth: 'айына бет',
    booksPerMonth: 'айына кітап',
    subscribe: '$9.99/айына жазылу',
    subscribing: 'Өңделуде...',
    currentBalance: 'Ағымдағы баланс',
    freeCoinsInfo: 'Бастау үшін тегін монеталар алыңыз',
    welcomeBonus: 'Қош келдіңіз бонусы',
    registrationBonus: 'Тіркелу бонусы',
    perPage: 'бір бет үшін',

    // Starter Pack
    starterPack: 'Стартер пакет',
    starterPackDesc: '500 монета — ~5 әңгіме жасаңыз суреттермен',
    starterPackPrice: '$5',
    starterPackCoins: 'монета',
    starterPackPages: 'бет',
    starterPackBooks: 'кітап',
    buyWithPaypal: 'PayPal арқылы сатып алу',
    paymentPending: 'Төлемнен кейін монеталар 24 сағат ішінде есептеледі',
    paymentInstructions: 'Аккаунтыңызды анықтау үшін PayPal төлем жазбасына email немесе пайдаланушы атыңызды жазыңыз',

    // Submissions halted
    submissionsHalted: 'Әңгімелер жасау уақытша тоқтатылды',
    submissionsHaltedDesc: 'Жоғары жүктеме салдарынан жаңа әңгімелер жасауды уақытша тоқтаттық. Кейінірек қайталап көріңіз!',
    whileYouWait: 'Сіз күткен кезде...',
    browseExistingStories: 'Біздің кітапханадағы бар әңгімелерді қарауға болады!',

    // Voice recording
    microphoneError: 'Микрофонға қол жеткізу қатесі',
    microphonePermission: 'Микрофонға қол жеткізу мүмкін болмады. Рұқсаттарды тексеріңіз.',
    recording: 'Жазылуда...',
    recognizingSpeech: 'Сөйлеуді тану...',
    recognizedText: 'Танылған мәтін',
    useAsStoryText: 'Әңгіме мәтіні ретінде пайдалану',

    // Image upload
    uploadImageFile: 'Сурет жүктеңіз',
    imageSizeLimit: 'Сурет өлшемі 5МБ-тан аз болуы керек',

    // Export
    export: 'Экспорт',
    webpageHtml: 'Веб-бет (HTML)',
    openInBrowser: 'Браузерде ашу',
    pdfForPrint: 'Басып шығару үшін PDF',
    readyToPrint: 'Басып шығаруға дайын',
    ebookEpub: 'Электрондық кітап (EPUB)',
    ereaderFormat: 'E-reader пішімі',
    exportError: 'Экспорт қатесі',

    // Search
    noStoriesFoundFor: 'Әңгімелер табылмады',
    foundStories: 'Табылды',
    story: 'әңгіме',
    storiesPlural: 'әңгіме',
    forSearch: 'үшін',

    // Skip to content
    skipToContent: 'Мазмұнға өту',

    // Read button
    read: 'Оқу',
    viewAllStories: 'Барлық әңгімелерді көру',

    // Languages
    russian: 'Орысша',
    english: 'Ағылшынша',
    kazakh: 'Қазақша',

    // Upsell modal
    notEnoughCoinsTitle: 'Монета жеткіліксіз',
    notEnoughCoinsDesc: 'Әңгіме жасау үшін көбірек монета қажет. Міне, оларды қалай алуға болады:',
    registerForBonus: 'Тегін тіркеліңіз',
    getRegistrationBonus: '+50 бонус монета алыңыз',
    getSubscription: 'Жазылу рәсімдеу',
    unlimitedStories: 'Шексіз әңгімелер жасаңыз',
    inviteFriends: 'Достарыңызды шақырыңыз',
    referralDescription: 'Сіздің сілтемеңіз арқылы тіркелген әр дос үшін 100 монета алыңыз!',
    copyLink: 'Сілтемені көшіру',
    linkCopied: 'Сілтеме көшірілді!',

    // Referral
    referralWelcome: 'Сізді шақырды!',
    referralBonusInfo: 'Тіркеліңіз және бонус монеталар алыңыз!',

    // Privacy
    photoPrivacyNotice: 'Барлық фотосуреттер құпия және қауіпсіз сақталады. Оларға ешкімнің қол жеткізуі жоқ.'
  }
}

export function useTranslation(language: Language) {
  return translations[language]
}
