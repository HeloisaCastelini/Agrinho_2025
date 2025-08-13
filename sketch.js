let campo = [];
let cidade = [];
let caminhoes = [];
let produtos = [];
let nuvens = [];
let tempo = 0;
let slider;

function setup() {
  createCanvas(800, 500);
  
  // Configuração do slider de velocidade
  slider = createSlider(0, 5, 1, 0.1);
  slider.position(20, 20);
  slider.style('width', '150px');
  
  // Criar elementos do campo (plantação)
  for (let i = 0; i < 50; i++) {
    campo.push({
      x: random(width * 0.4),
      y: random(height * 0.5, height * 0.9),
      tipo: floor(random(3)), // 0=trigo, 1=milho, 2=soja
      crescimento: random(0.2, 0.8)
    });
  }
  
  // Criar prédios da cidade
  for (let i = 0; i < 12; i++) {
    const altura = random(80, 250);
    cidade.push({
      x: width * 0.6 + random(width * 0.35),
      y: height - altura - 20,
      largura: random(40, 100),
      altura: altura,
      cor: color(70 + random(50), 70 + random(50), 80 + random(50))
    });
  }
  
  // Criar caminhões
  for (let i = 0; i < 4; i++) {
    caminhoes.push(new Caminhao());
  }
  
  // Criar nuvens
  for (let i = 0; i < 5; i++) {
    nuvens.push({
      x: random(width),
      y: random(height * 0.3),
      tamanho: random(50, 120),
      velocidade: random(0.2, 0.8)
    });
  }
}

function draw() {
  // Céu gradiente
  drawGradient(0, 0, width, height * 0.6, 
               color(100, 180, 255), color(200, 230, 255));
  
  // Sol
  drawSol();
  
  // Nuvens
  drawNuvens();
  
  // Campo (terra)
  fill(139, 69, 19);
  noStroke();
  rect(0, height * 0.6, width * 0.5, height * 0.4);
  
  // Plantação
  drawPlantacao();
  
  // Cidade (asfalto)
  fill(50, 50, 50);
  rect(width * 0.5, height * 0.9, width * 0.5, height * 0.1);
  
  // Prédios
  drawPredios();
  
  // Estrada conectando campo e cidade
  drawEstrada();
  
  // Caminhões
  updateCaminhoes();
  
  // Produtos transportados
  updateProdutos();
  
  // Interface
  drawInterface();
  
  tempo += 0.01 * slider.value();
}

// Classe Caminhão
class Caminhao {
  constructor() {
    this.reset();
    this.carga = floor(random(3));
    this.cor = [
      color(200, 50, 50), // vermelho
      color(50, 100, 200), // azul
      color(50, 150, 50)  // verde
    ][this.carga];
  }
  
  reset() {
    this.x = random() > 0.5 ? -100 : width + 100;
    this.y = height * 0.85;
    this.velocidade = random(2, 4) * (this.x < 0 ? 1 : -1);
    this.carregando = false;
    this.tempoCarga = 0;
  }
  
  update() {
    this.x += this.velocidade * slider.value();
    
    // Lógica de carga/descarga
    if (!this.carregando) {
      if ((this.velocidade > 0 && this.x > width * 0.35 && this.x < width * 0.45) ||
          (this.velocidade < 0 && this.x > width * 0.55 && this.x < width * 0.65)) {
        this.tempoCarga++;
        if (this.tempoCarga > 60) {
          this.carregando = true;
          produtos.push({
            x: this.x,
            y: this.y - 30,
            tipo: this.carga,
            direcao: this.velocidade > 0 ? 1 : -1
          });
        }
      }
    }
    
    // Reset quando sair da tela
    if (this.x < -150 || this.x > width + 150) {
      this.reset();
    }
  }
  
  display() {
    push();
    translate(this.x, this.y);
    
    // Cabine
    fill(this.cor);
    rect(-25, -20, 50, 20, 5);
    
    // Carroceria
    fill(200);
    rect(25, -25, 40, 25, 0, 5, 5, 0);
    
    // Rodas
    fill(40);
    ellipse(-15, 0, 15, 8);
    ellipse(15, 0, 15, 8);
    ellipse(40, 0, 15, 8);
    
    // Farol
    fill(255, 200, 0);
    if (this.velocidade > 0) {
      rect(30, -15, 5, 3);
    } else {
      rect(-30, -15, 5, 3);
    }
    
    pop();
  }
}

function drawGradient(x, y, w, h, c1, c2) {
  noFill();
  for (let i = y; i <= y + h; i++) {
    let inter = map(i, y, y + h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x + w, i);
  }
}

function drawSol() {
  fill(255, 220, 50);
  noStroke();
  let pulso = sin(tempo * 0.5) * 5;
  ellipse(width * 0.2, height * 0.2, 80 + pulso, 80 + pulso);
}

function drawNuvens() {
  fill(255, 255, 255, 200);
  noStroke();
  for (let nuvem of nuvens) {
    nuvem.x += nuvem.velocidade * slider.value();
    if (nuvem.x > width + 100) nuvem.x = -100;
    
    ellipse(nuvem.x, nuvem.y, nuvem.tamanho, nuvem.tamanho * 0.6);
    ellipse(nuvem.x + nuvem.tamanho * 0.3, nuvem.y - nuvem.tamanho * 0.1, 
            nuvem.tamanho * 0.8, nuvem.tamanho * 0.5);
    ellipse(nuvem.x - nuvem.tamanho * 0.3, nuvem.y + nuvem.tamanho * 0.1, 
            nuvem.tamanho * 0.7, nuvem.tamanho * 0.4);
  }
}

function drawPlantacao() {
  for (let planta of campo) {
    planta.crescimento += 0.001 * slider.value();
    if (planta.crescimento > 1) planta.crescimento = 0;
    
    const h = map(sin(planta.crescimento * PI), 0, 1, 5, 30);
    
    if (planta.tipo === 0) { // Trigo
      fill(210, 180, 30);
      rect(planta.x - 2, planta.y - h, 4, h);
      fill(255, 240, 150);
      ellipse(planta.x, planta.y - h - 5, 10, 8);
    } 
    else if (planta.tipo === 1) { // Milho
      fill(50, 120, 40);
      rect(planta.x - 3, planta.y - h, 6, h);
      fill(220, 150, 30);
      ellipse(planta.x, planta.y - h * 0.7, 8, 12);
    } 
    else { // Soja
      fill(70, 150, 60);
      rect(planta.x - 4, planta.y - h, 8, h);
      fill(80, 100, 30);
      ellipse(planta.x, planta.y - h * 0.5, 12, 8);
    }
  }
}

function drawPredios() {
  for (let predio of cidade) {
    // Prédio
    fill(predio.cor);
    rect(predio.x, predio.y, predio.largura, predio.altura);
    
    // Janelas
    fill(255, 255, 150, 200);
    const colunas = floor(predio.largura / 15);
    const linhas = floor(predio.altura / 20);
    
    for (let c = 0; c < colunas; c++) {
      for (let l = 0; l < linhas; l++) {
        if (random() > 0.3) { // Janelas acesas aleatoriamente
          rect(
            predio.x + 10 + c * 15,
            predio.y + 10 + l * 20,
            8, 8
          );
        }
      }
    }
  }
}

function drawEstrada() {
  // Estrada principal
  fill(80);
  beginShape();
  vertex(width * 0.3, height * 0.9);
  vertex(width * 0.35, height * 0.7);
  vertex(width * 0.65, height * 0.7);
  vertex(width * 0.7, height * 0.9);
  endShape(CLOSE);
  
  // Linhas da estrada
  stroke(255, 255, 0);
  strokeWeight(3);
  line(width * 0.325, height * 0.8, width * 0.675, height * 0.8);
  strokeWeight(2);
  for (let i = 0; i < 5; i++) {
    const x = map(i, 0, 4, width * 0.35, width * 0.65);
    line(x, height * 0.73, x + 10, height * 0.73);
  }
  noStroke();
}

function updateCaminhoes() {
  for (let caminhao of caminhoes) {
    caminhao.update();
    caminhao.display();
  }
}

function updateProdutos() {
  for (let i = produtos.length - 1; i >= 0; i--) {
    const p = produtos[i];
    p.x += 2 * p.direcao * slider.value();
    p.y += sin(tempo * 5 + i) * 0.5;
    
    // Desenhar produto
    fill(
      p.tipo === 0 ? color(240, 220, 100) : 
      p.tipo === 1 ? color(250, 180, 50) : 
      color(150, 200, 100)
    );
    ellipse(p.x, p.y, 15, 10);
    
    // Remover se sair da tela
    if (p.x < -20 || p.x > width + 20) {
      produtos.splice(i, 1);
    }
  }
}

function drawInterface() {
  fill(0, 0, 0, 150);
  rect(10, 10, 180, 60, 5);
  
  fill(255);
  textSize(14);
  textAlign(LEFT);
  text("Velocidade: " + slider.value().toFixed(1), 20, 40);
  text("Caminhões: " + caminhoes.length, 20, 60);
  
  // Legenda
  textSize(16);
  textAlign(CENTER);
  text("CAMPO", width * 0.25, height - 10);
  text("CIDADE", width * 0.75, height - 10);
}

function mousePressed() {
  // Adiciona um novo caminhão ao clicar
  if (mouseX > 10 && mouseX < 190 && mouseY > 10 && mouseY < 70) {
    caminhoes.push(new Caminhao());
  }
}