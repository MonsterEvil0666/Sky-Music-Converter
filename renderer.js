// Função Escolher Arquivo
document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function () {
        document.getElementById('fileContent').innerText = reader.result;
    };

    if (file) {
        reader.readAsText(file);
    }
});

// Função Botão Converter Texto
document.getElementById('convertButton').addEventListener('click', function () {
    const originalText = document.getElementById('fileContent').innerText;
    const convertedText = convertToHotkey(originalText);


    // Cria uma nova caixa de texto e exibe o conteúdo convertido
    const resultBox = document.createElement('pre');
    resultBox.innerText = convertedText;


    // Adiciona a nova caixa de texto dentro da div 'convertedText'
    const convertedTextDiv = document.getElementById('convertedText');
    convertedTextDiv.innerHTML = '';  // Limpa o conteúdo existente, se houver
    convertedTextDiv.appendChild(resultBox);
});

// Função para copiar o texto convertido para a área de transferência
function copyConvertedText() {
    const convertedText = document.getElementById('convertedText').innerText;
  
    // Cria um elemento de texto temporário
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = convertedText;

    // Adiciona o elemento ao corpo do documento
    document.body.appendChild(tempTextArea);

    // Seleciona e copia o texto
    tempTextArea.select();
    document.execCommand('copy');

    // Remove o elemento temporário
    document.body.removeChild(tempTextArea);
}

// Função Lógica para conversão do texto
function convertToHotkey(text) {
    
    // Fase 1: Deleta ',"l":2' do código
    const regexPhase1 = /,"l":[2-9]/g;
    const textAfterPhase1 = text.replace(regexPhase1, '');

    // Fase 2: Remover conteúdo entre colchetes abertos, para remoção de título
    const regexPhase2 = /\[.*?\[/; 
    const textAfterPhase2 = textAfterPhase1.replace(regexPhase2, '');

    // Fase 3: Remover os caracteres ] { "
    const regexPhase3 = /[\]\{\}"]/g; // Expressão regular para encontrar ] { "
    const textAfterPhase3 = textAfterPhase2.replace(regexPhase3, '');

    // Fase 4: Substituir vírgulas por quebras de linha
    const regexPhase4 = /,/g;
    const textAfterPhase4 = textAfterPhase3.replace(regexPhase4, '\n');

    // Fase 5: Substituir Keys variantes para '1Key'
    const regexPhase5 = /[2-9]Key/g;
    const textAfterPhase5 = textAfterPhase4.replace(regexPhase5, '1Key');

    // Fase 6: Ajustar o tempo com base na velocidade selecionada
    const speedElement = document.getElementById('speedSelect');
    const speed = parseInt(speedElement.value) || 100; // Obtém o valor do elemento speedSelect
    const speedMultiplier = 1 / (speed / 100); // Invertido o multiplicador
    const regexPhase6 = /time:(\d+)/g;
    const textAfterPhase6 = textAfterPhase5.replace(regexPhase6, (_, delay) => {
        const currentDelay = parseInt(delay, 10);
        const adjustedDelay = Math.max(1, Math.round(currentDelay * speedMultiplier)); // Garante que o valor não seja menor que 1
        return `time:${adjustedDelay}`;
    });

    // Fase 7: Substitui algumas Keys para suas devidas teclas
    const replacementMap = {
    '1Key10': 'N',
    '1Key11': 'M',
    '1Key12': ',',
    '1Key13': '.',
    '1Key14': '/',
     };
    const regexPhase7 = new RegExp(Object.keys(replacementMap).join('|'), 'g');
    const textAfterPhase7 = textAfterPhase6.replace(regexPhase7, match => replacementMap[match]);

    // Fase 8: Substitui restante das Keys para suas devidas teclas, Keys menores precisam ser ajustadas após keys maiores.
    const customReplacementMap = {
    '1Key0': 'Y',
    '1Key1': 'U',
    '1Key2': 'I',
    '1Key3': 'O',
    '1Key4': 'P',
    '1Key5': 'H',
    '1Key6': 'J',
    '1Key7': 'K',
    '1Key8': 'L',
    '1Key9': ';',
    };
    const regexPhase8 = new RegExp(Object.keys(customReplacementMap).join('|'), 'g');
    const textAfterPhase8 = textAfterPhase7.replace(regexPhase8, match => customReplacementMap[match]);

    // Fase 9: Conversão específica "time:" para "Delay : " e adicionar " ms" após o número
    const regexPhase9 = /time:(\d+)/g;
    const textAfterPhase9 = textAfterPhase8.replace(regexPhase9, 'Delay : $1 ms');

    // Fase 10: Cálculo de diferença dos delays
    const regexPhase10 = /Delay : (\d+) ms/g;
    let previousDelay = 0;
    const textAfterPhase10 = textAfterPhase9.replace(regexPhase10, (_, delay) => {
      const currentDelay = parseInt(delay, 10);
      const calculatedDelay = previousDelay !== 0 ? currentDelay - previousDelay : currentDelay;
      previousDelay = currentDelay;
      return `Delay : ${calculatedDelay} ms`;
    });

    // Fase 11: Substituição de "Key:" para setar Key Up e Key Down
    const regexPhase11 = /key:(\w+)/g;
    const textAfterPhase11 = textAfterPhase10.replace(regexPhase11, 'Key Down : $1\nDelay : 1 ms\nKey Up : $1');

    // Fase 12: Substituição temporaria de teclas especiais para evitar erros nos proximos passos.
    const specialKeyMap = {
        '/': 'Slash',
        ';': 'Semicolon',
        '.': 'Period',
        ',': 'Comma',
    };
    const regexPhase12 = /key:([/;.,])/g;
    const textAfterPhase12 = textAfterPhase11.replace(regexPhase12, (_, key) => {
        const replacement = specialKeyMap[key] || key;
        return `Key Down : ${replacement}\nDelay : 1 ms\nKey Up : ${replacement}`;
    });

    // Fase 13: Adicionar Start Delay no inicio do texto
    const delayValue = document.getElementById('delayInput').value || 1500;
    const delayAboveText = `Delay : ${delayValue} ms\n`;
    const textAfterPhase13 = delayAboveText + textAfterPhase12;

    // Fase 14: Remover linhas com "Delay : 0 ms" que não podem ser lidas pelo Automatic Keyboard
    const regexPhase14 = /Delay : 0 ms\n/g;
    const textAfterPhase14 = textAfterPhase13.replace(regexPhase14, '');

    // Fase 15: Substituir de volta caracteres temporarios
    const specificReplacementTable = {
        'Slash': '/',
        'Semicolon': ';',
        'Period': '.',
        'Comma': ','
    };
    const regexPhase15 = new RegExp(Object.keys(specificReplacementTable).join('|'), 'g');
    const textAfterPhase15 = textAfterPhase14.replace(regexPhase15, match => specificReplacementTable[match]);

    // Fase 16: Remover linhas com "Delay : 1 ms" para correção de falhas
    const regexPhase16 = /Delay : 1 ms\n/g;
    const textAfterPhase16 = textAfterPhase15.replace(regexPhase16, '');

    // Fase 17: Reorganizar "Key Up:" e "Key Down" para 10 notas simultâneas
    const regexPhase17 = /Key Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)/g;
    const textAfterPhase17 = textAfterPhase16.replace(regexPhase17, 'Key Down : $2\nKey Down : $4\nKey Down : $6\nKey Down : $8\nKey Down : $10\nKey Down : $12\nKey Down : $14\nDelay : 1 ms\nKey Up : $1\nKey Up : $3\nKey Up : $5\nKey Up : $7\nKey Up : $9\nKey Up : $11\nKey Up : $13');
   
    // Fase 18: Reorganizar "Key Up:" e "Key Down" para 8 notas simultâneas
    const regexPhase18 = /Key Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)/g;
    const textAfterPhase18 = textAfterPhase17.replace(regexPhase18, 'Key Down : $2\nKey Down : $4\nKey Down : $6\nKey Down : $8\nKey Down : $10\nKey Down : $12\nDelay : 1 ms\nKey Up : $1\nKey Up : $3\nKey Up : $5\nKey Up : $7\nKey Up : $9\nKey Up : $11');
 
    // Fase 19: Reorganizar "Key Up:" e "Key Down" para 6 notas simultâneas
    const regexPhase19 = /Key Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)/g;
    const textAfterPhase19 = textAfterPhase18.replace(regexPhase19, 'Key Down : $2\nKey Down : $4\nKey Down : $6\nKey Down : $8\nKey Down : $10\nDelay : 1 ms\nKey Up : $1\nKey Up : $3\nKey Up : $5\nKey Up : $7\nKey Up : $9');

    // Fase 20: Reorganizar "Key Up:" e "Key Down" para 5 notas simultâneas
    const regexPhase20 = /Key Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)/g;
    const textAfterPhase20 = textAfterPhase19.replace(regexPhase20, 'Key Down : $2\nKey Down : $4\nKey Down : $6\nKey Down : $8\nDelay : 1 ms\nKey Up : $1\nKey Up : $3\nKey Up : $5\nKey Up : $7');

    // Fase 21: Reorganizar "Key Up:" e "Key Down" para 4 notas simultâneas
    const regexPhase21 = /Key Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)/g;
    const textAfterPhase21 = textAfterPhase20.replace(regexPhase21, 'Key Down : $2\nKey Down : $4\nKey Down : $6\nDelay : 1 ms\nKey Up : $1\nKey Up : $3\nKey Up : $5');

    // Fase 22: Reorganizar "Key Up:" e "Key Down" para 3 notas simultâneas
    const regexPhase22 = /Key Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)/g;
    const textAfterPhase22 = textAfterPhase21.replace(regexPhase22, 'Key Down : $2\nKey Down : $4\nDelay : 1 ms\nKey Up : $1\nKey Up : $3');
    
    // Fase 23: Reorganizar "Key Up:" e "Key Down:" para organizar Key Down e Key Up únicos corretamente.
    const regexPhase23 = /Key Up : ([\w,.;/]+)\nKey Down : ([\w,.;/]+)/g;
    const textAfterPhase23 = textAfterPhase22.replace(regexPhase23, 'Key Down : $2\nDelay : 1 ms\nKey Up : $1');

    // Fase 24: Reorganizar "Key Up:" e "Key Down:" invertendo a ordem e inserindo "Delay : 1 ms" entre eles
    const regexPhase24 = /Key Down : ([\w,.;/]+)\nKey Up : ([\w,.;/]+)/g;
    const textAfterPhase24 = textAfterPhase23.replace(regexPhase24, 'Key Down : $1\nDelay : 1 ms\nKey Up : $2');

    return textAfterPhase24;
}
