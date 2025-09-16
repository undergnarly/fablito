// Тестовая функция для проверки новой логики генерации
export async function testNewStoryGeneration(params: any) {
  console.log(`[TEST-GEN] 🧪 Тестируем новую логику генерации...`)
  
  // Получаем возрастные гайдлайны из story-generator
  const { getAgeAppropriateGuidelines } = await import('./story-generator')
  const ageGuidelines = getAgeAppropriateGuidelines(params.childAge)
  console.log(`[TEST-GEN] 📈 Возрастные гайдлайны (${params.childAge} лет):`, ageGuidelines)
  
  // Создаем промпт с новой логикой
  const enhancedPrompt = `🎆 НОВАЯ ЛОГИКА ГЕНЕРАЦИИ СКАЗОК!

👶 Ребенок: ${params.childName} (${params.childAge} лет)
🎭 Тема: ${params.theme}
🌍 Язык: ${params.style.language}
${params.textStory ? `📜 Идея от родителя: ${params.textStory}` : ''}

${ageGuidelines}

🚀 Новая логика работает!`
  
  console.log(`[TEST-GEN] 📦 Генерируем промпт:`, enhancedPrompt)
  
  // Возвращаем тестовый результат
  return {
    title: `🎆 ${params.childName}'s Magical Adventure`, // Автогенерация названия
    pages: [
          {
            pageNumber: 1,
            text: `Когда-то жил${params.childName.endsWith('а') ? 'а' : ''} один ${params.childName}...`
          },
          {
            pageNumber: 2,
            text: `И вдруг ${params.childName} открыл${params.childName.endsWith('а') ? 'а' : ''} важную тайну...`
          },
          {
            pageNumber: 3,
            text: `${params.childName} встретил${params.childName.endsWith('а') ? 'а' : ''} волшебного друга...`
          },
          {
            pageNumber: 4,
            text: `Вместе они отправились в удивительное приключение...`
          },
          {
            pageNumber: 5,
            text: `На пути им встретилось первое испытание...`
          },
          {
            pageNumber: 6,
            text: `${params.childName} проявил${params.childName.endsWith('а') ? 'а' : ''} храбрость и доброту...`
          },
          {
            pageNumber: 7,
            text: `Друзья помогли друг другу преодолеть трудности...`
          },
          {
            pageNumber: 8,
            text: `Благодаря ${params.theme.toLowerCase()}, они нашли решение...`
          },
          {
            pageNumber: 9,
            text: `${params.childName} понял${params.childName.endsWith('а') ? 'а' : ''} важный урок...`
          },
          {
            pageNumber: 10,
            text: `И с тех пор ${params.childName} всегда помнил${params.childName.endsWith('а') ? 'а' : ''} о силе ${params.theme.toLowerCase()}!`
          }
    ],
    ageGuidelines,
    testResult: '✅ Новая логика работает!'
  }
}
