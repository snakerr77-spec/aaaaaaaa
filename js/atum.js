const canvas = document.getElementById("canvasAssinatura");
const ctx = canvas.getContext("2d");

const btnLimpar = document.getElementById("btnLimpar");
const btnSalvar = document.getElementById("btnSalvar");
const btnBaixar = document.getElementById("btnBaixar");

const previewAssinatura = document.getElementById("previewAssinatura");
const resultado = document.getElementById("resultado");
const nomePessoa = document.getElementById("nomePessoa");
const nomeSalvo = document.getElementById("nomeSalvo");

let desenhando = false;
let assinaturaSalva = null;
let temAssinatura = false;

function ajustarCanvas() {
  const area = canvas.parentElement;
  const ratio = Math.max(window.devicePixelRatio || 1, 1);

  canvas.width = area.offsetWidth * ratio;
  canvas.height = area.offsetHeight * ratio;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  configurarCaneta();
}

function configurarCaneta() {
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#111111";
}

function pegarPosicao(evento) {
  const rect = canvas.getBoundingClientRect();

  let clienteX;
  let clienteY;

  if (evento.touches && evento.touches.length > 0) {
    clienteX = evento.touches[0].clientX;
    clienteY = evento.touches[0].clientY;
  } else {
    clienteX = evento.clientX;
    clienteY = evento.clientY;
  }

  return {
    x: clienteX - rect.left,
    y: clienteY - rect.top
  };
}

function iniciarDesenho(evento) {
  evento.preventDefault();

  desenhando = true;
  temAssinatura = true;

  const pos = pegarPosicao(evento);

  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

function desenhar(evento) {
  if (!desenhando) return;

  evento.preventDefault();

  const pos = pegarPosicao(evento);

  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}

function pararDesenho() {
  desenhando = false;
  ctx.closePath();
}

function limparAssinatura() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  assinaturaSalva = null;
  temAssinatura = false;

  previewAssinatura.src = "";
  resultado.classList.remove("ativo");
  btnBaixar.disabled = true;
}

function salvarAssinatura() {
  if (!temAssinatura) {
    alert("Faça sua assinatura antes de salvar.");
    return;
  }

  assinaturaSalva = canvas.toDataURL("image/png");

  previewAssinatura.src = assinaturaSalva;
  resultado.classList.add("ativo");
  btnBaixar.disabled = false;

  const nome = nomePessoa.value.trim();

  if (nome) {
    nomeSalvo.textContent = `Assinado por: ${nome}`;
  } else {
    nomeSalvo.textContent = "Assinatura pronta para uso.";
  }

  localStorage.setItem("assinaturaDigital", assinaturaSalva);
  localStorage.setItem("nomeAssinante", nome);
}

function baixarAssinatura() {
  if (!assinaturaSalva) return;

  const link = document.createElement("a");
  const nomeArquivo = nomePessoa.value.trim()
    ? `assinatura-${nomePessoa.value.trim().replaceAll(" ", "-").toLowerCase()}.png`
    : "assinatura-digital.png";

  link.href = assinaturaSalva;
  link.download = nomeArquivo;
  link.click();
}

canvas.addEventListener("mousedown", iniciarDesenho);
canvas.addEventListener("mousemove", desenhar);
canvas.addEventListener("mouseup", pararDesenho);
canvas.addEventListener("mouseleave", pararDesenho);

canvas.addEventListener("touchstart", iniciarDesenho, { passive: false });
canvas.addEventListener("touchmove", desenhar, { passive: false });
canvas.addEventListener("touchend", pararDesenho);

btnLimpar.addEventListener("click", limparAssinatura);
btnSalvar.addEventListener("click", salvarAssinatura);
btnBaixar.addEventListener("click", baixarAssinatura);

window.addEventListener("load", () => {
  ajustarCanvas();

  const assinaturaAntiga = localStorage.getItem("assinaturaDigital");
  const nomeAntigo = localStorage.getItem("nomeAssinante");

  if (assinaturaAntiga) {
    assinaturaSalva = assinaturaAntiga;
    previewAssinatura.src = assinaturaAntiga;
    resultado.classList.add("ativo");
    btnBaixar.disabled = false;

    if (nomeAntigo) {
      nomePessoa.value = nomeAntigo;
      nomeSalvo.textContent = `Assinado por: ${nomeAntigo}`;
    }
  }
});

window.addEventListener("resize", ajustarCanvas);