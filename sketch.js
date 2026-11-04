let ondas = [];
let modoVisual = 1; 
let totalModos = 4;

// Áudio 
let audioCtx;
let musicaIniciada = false;

function setup() {
  // Faz o canvas ocupar a largura e altura total da janela do navegador
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // Fundo escuro com rasto suave (efeito de iluminação)
  background(240, 20, 12, 0.12);
  
  // Determinar o tom da cor pela posição do rato
  let hueBase;
  if (mouseX < width / 2 && mouseY < height / 2) {
    hueBase = 200; // Azul Oceano
  } else if (mouseX >= width / 2 && mouseY < height / 2) {
    hueBase = 280; // Roxo Místico
  } else if (mouseX < width / 2 && mouseY >= height / 2) {
    hueBase = 35;  // Âmbar Quente
  } else {
    hueBase = 150; // Verde Menta
  }

  // Linhas guia do centro
  stroke(hueBase, 30, 40, 0.12);
  strokeWeight(1);
  line(width / 2, 0, width / 2, height);
  line(0, height / 2, width, height / 2);
  
  // Desenhar ondas
  for (let i = ondas.length - 1; i >= 0; i--) {
    let o = ondas[i];
    
    o.raio += 1.8;
    o.alfa -= 0.012;

    noFill();
    stroke(o.cor, 70, 90, o.alfa);
    strokeWeight(2);

    // Desenhar as diferentes formas geométricas
    if (o.forma === 1) {
      ellipse(o.x, o.y, o.raio * 2);
    } 
    else if (o.forma === 2) {
      rectMode(CENTER);
      rect(o.x, o.y, o.raio * 2, o.raio * 2, 8);
    } 
    else if (o.forma === 3) {
      desenharTriangulo(o.x, o.y, o.raio);
    } 
    else if (o.forma === 4) {
      desenharEstrela(o.x, o.y, o.raio * 0.5, o.raio, 5);
    }

    if (o.alfa <= 0 || o.raio > Math.max(width, height)) {
      ondas.splice(i, 1);
    }
  }
  
  // Interface e Informações
  noStroke();
  fill(0, 0, 100, 0.9);
  textSize(13);
  textAlign(LEFT, TOP);
  text("Clica no ecrã para criar ondas de luz e som", 25, 25);
  
  // Nome da forma atual (Corrigido para modoVisual - 1)
  let nomesFormas = ["Círculos", "Quadrados", "Triângulos", "Estrelas"];
  text(`[ESPAÇO] Mudar Forma (Atual: ${nomesFormas[modoVisual - 1]}) | [C] Limpar`, 25, 48);

  if (!musicaIniciada) {
    fill(0, 0, 100, 0.5);
    text("🎵 Clica em qualquer lado para ativar a música de fundo calma", 25, height - 30);
  }
}

// Clique do Rato / Toque no Ecrã
function mousePressed() {
  if (!musicaIniciada) {
    iniciarAudio();
    musicaIniciada = true;
  }

  let corOnda;
  let notaFreq;

  // Ajusta a cor e a nota musical de acordo com a área clicada
  if (mouseX < width / 2 && mouseY < height / 2) {
    corOnda = 200; 
    notaFreq = 261.63; // Nota Dó
  } else if (mouseX >= width / 2 && mouseY < height / 2) {
    corOnda = 280; 
    notaFreq = 329.63; // Nota Mi
  } else if (mouseX < width / 2 && mouseY >= height / 2) {
    corOnda = 35;  
    notaFreq = 392.00; // Nota Sol
  } else {
    corOnda = 150; 
    notaFreq = 440.00; // Nota Lá
  }

  ondas.push({
    x: mouseX,
    y: mouseY,
    raio: 10,
    cor: corOnda,
    forma: modoVisual,
    alfa: 1.0
  });

  tocarNotaAmbiental(notaFreq, 1.2, 0.15);
}

// Input do Teclado
function keyPressed() {
  if (key === ' ' || keyCode === UP_ARROW) {
    modoVisual++;
    if (modoVisual > totalModos) {
      modoVisual = 1;
    }
  } else if (key === 'c' || key === 'C') {
    ondas = [];
  }
}

// Desenhar Formas Personalizadas
function desenharTriangulo(x, y, r) {
  push();
  translate(x, y);
  beginShape();
  for (let a = 0; a < TWO_PI; a += TWO_PI / 3) {
    let sx = cos(a - HALF_PI) * r;
    let sy = sin(a - HALF_PI) * r;
    vertex(sx, sy);
  }
  endShape(CLOSE);
  pop();
}

function desenharEstrela(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

// SINTETIZADOR AMBIENTAL (Web Audio API)
function iniciarAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  let escalaPentatonica = [196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00];
  
  setInterval(() => {
    if (musicaIniciada && audioCtx) {
      let nota = random(escalaPentatonica);
      tocarNotaAmbiental(nota, 3.0, 0.04);
    }
  }, 1800);
}

function tocarNotaAmbiental(freq, duracao, vol = 0.1) {
  if (!audioCtx) return;
  try {
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duracao);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duracao);
  } catch(e) {}
}