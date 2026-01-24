export function showEightBall(popup) {
 
  const popupText = document.getElementById('popup-text');
  if (popupText) popupText.textContent = '';

  
  const existingContainer = document.getElementById('eightball-container');
  if (existingContainer) existingContainer.remove();

  const container = document.createElement('div');
  container.id = 'eightball-container';
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
  `;
  popup.appendChild(container);

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Ask a question...';
  input.style.cssText = `
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    width: 200px;
    text-align: center;
  `;
  container.appendChild(input);

  const button = document.createElement('button');
  button.textContent = 'ask Chihuahua psychic';
  button.style.cssText = `
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    background: #3b5a7d;
    color: white;
    cursor: pointer;
  `;
  container.appendChild(button);

  const answer = document.createElement('div');
  answer.style.cssText = `
    margin-top: 10px;
    font-weight: bold;
    color: #ffd700;
  `;
  container.appendChild(answer);

  const responses = [
    "Yess✅",         
    "No",          
    "💯",         
    "ʻAe",        
    "ʻAʻole",     
    "Si",    
    "🤷‍♀️",       
    ];

  button.addEventListener('click', () => {
    const question = input.value.trim();
    if (!question) {
      answer.textContent = "You need to ask something!";
      return;
    }
    const randomAnswer = responses[Math.floor(Math.random() * responses.length)];
    answer.textContent = randomAnswer;
  });

  return function stopEightBall() {
    container.remove();
  };
}
