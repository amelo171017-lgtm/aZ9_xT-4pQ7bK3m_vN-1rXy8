(() => {
  const WEBHOOK_URL = "https://amelo171017.app.n8n.cloud/webhook/get";
  const WEBHOOK_URL_TEST = "https://amelo171017.app.n8n.cloud/webhook-test/get"; 

  const form = document.getElementById("code-form");
  const input = document.getElementById("access-code");
  const errorMsg = document.getElementById("error-msg");
  const initialScreen = document.getElementById("initial-screen");
  const secondScreen = document.getElementById("second-screen");
  const dynamicContent = document.getElementById("dynamic-content");
  const toggleCodeBtn = document.getElementById("toggle-code");

  const modal = document.getElementById("modal");
  const pdfFrame = document.getElementById("pdf-frame");
  const modalTitle = document.getElementById("modal-title");

  function showError(message) {
    errorMsg.textContent = message;
  }

  function clearError() {
    errorMsg.textContent = "";
  }

  // Função para alternar entre mostrar/ocultar o código
  function toggleCodeVisibility() {
    if (input.type === "password") {
      input.type = "text";
      toggleCodeBtn.textContent = "Ocultar código";
    } else {
      input.type = "password";
      toggleCodeBtn.textContent = "Ver código";
    }
  }

  // Converte o link do Drive para o formato de preview
  function getDrivePreviewLink(link) {
    if (!link || typeof link !== 'string') return '';
    try {
      const url = new URL(link);
      if (url.hostname === 'drive.google.com' && url.pathname.startsWith('/file/d/')) {
        const fileId = url.pathname.split('/')[3];
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
      return link;
    } catch {
      return link;
    }
  }

  function openModal(title, link) {
    const previewLink = getDrivePreviewLink(link);
    if (!previewLink) return;
    
    pdfFrame.src = previewLink;
    modalTitle.textContent = title;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    pdfFrame.src = "about:blank";
    document.body.style.overflow = "";
  }

  // Função para renderizar o conteúdo dinamicamente
  function renderContent(data) {
    dynamicContent.innerHTML = '';
    
    // Aplicar CSS Grid diretamente
    const screenWidth = window.innerWidth;
    if (screenWidth >= 992) {
      // PC - 3 cards por linha
      dynamicContent.style.display = 'grid';
      dynamicContent.style.gridTemplateColumns = 'repeat(3, 1fr)';
      dynamicContent.style.gap = '24px';
      dynamicContent.style.maxWidth = '1200px';
    } else if (screenWidth >= 768) {
      // Tablet - 2 cards por linha
      dynamicContent.style.display = 'grid';
      dynamicContent.style.gridTemplateColumns = 'repeat(2, 1fr)';
      dynamicContent.style.gap = '20px';
      dynamicContent.style.maxWidth = '800px';
    } else {
      // Celular - 1 card por linha
      dynamicContent.style.display = 'grid';
      dynamicContent.style.gridTemplateColumns = '1fr';
      dynamicContent.style.gap = '16px';
      dynamicContent.style.maxWidth = '100%';
    }

    if (!data || data.length === 0) {
      dynamicContent.innerHTML = '<p class="error">Nenhum material disponível.</p>';
      return;
    }

    data.forEach((item, index) => {
      for (let i = 1; i <= 6; i++) {
        const subjectKey = `subject${i}`;
        const examKey = `exam${i}`;
        const answerKey = `answer${i}`;

        const subject = item[subjectKey];
        const examLink = item[examKey];
        const answerLink = item[answerKey];

        if (subject) {
          const section = document.createElement('div');
          section.classList.add('subject-section');
          section.style.animationDelay = `${index * 0.1 + i * 0.05}s`;

          const h2 = document.createElement('h2');
          h2.textContent = subject.charAt(0).toUpperCase() + subject.slice(1);
          section.appendChild(h2);

          const actionsDiv = document.createElement('div');
          actionsDiv.classList.add('actions');

          if (examLink) {
            const provaBtn = document.createElement('button');
            provaBtn.classList.add('action-btn');
            provaBtn.textContent = 'Ver prova';
            provaBtn.addEventListener('click', () => openModal(`Prova de ${subject.charAt(0).toUpperCase() + subject.slice(1)}`, examLink));
            actionsDiv.appendChild(provaBtn);
          }

          if (answerLink) {
            const respostaBtn = document.createElement('button');
            respostaBtn.classList.add('action-btn', 'secondary');
            respostaBtn.textContent = 'Ver resposta';
            respostaBtn.addEventListener('click', () => openModal(`Resposta de ${subject.charAt(0).toUpperCase() + subject.slice(1)}`, answerLink));
            actionsDiv.appendChild(respostaBtn);
          }

          if (actionsDiv.children.length > 0) {
            section.appendChild(actionsDiv);
            dynamicContent.appendChild(section);
          }
        }
      }
    });
  }

  async function sendCodeToWebhook(code) {
    clearError();
    const url = new URL(WEBHOOK_URL);
    url.searchParams.append("code", code);
    url.searchParams.append("security_token", WEBHOOK_URL_TEST);

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        renderContent(data);
        showSecondScreen();
      } else {
        showError(data.message || "Erro ao validar código. Tente novamente.");
      }
    } catch (error) {
      showError("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
    }
  }

  function showSecondScreen() {
    initialScreen.classList.add('fade-out');
    
    setTimeout(() => {
      initialScreen.style.display = "none";
      secondScreen.style.display = "flex";
      secondScreen.classList.add('fade-in');
    }, 300);
  }

  // Função para ajustar o grid baseado no tamanho da tela
  function adjustGrid() {
    if (!dynamicContent.children.length) return;
    
    const screenWidth = window.innerWidth;
    if (screenWidth >= 992) {
      // PC - 3 cards por linha
      dynamicContent.style.display = 'grid';
      dynamicContent.style.gridTemplateColumns = 'repeat(3, 1fr)';
      dynamicContent.style.gap = '24px';
      dynamicContent.style.maxWidth = '1200px';
    } else if (screenWidth >= 768) {
      // Tablet - 2 cards por linha
      dynamicContent.style.display = 'grid';
      dynamicContent.style.gridTemplateColumns = 'repeat(2, 1fr)';
      dynamicContent.style.gap = '20px';
      dynamicContent.style.maxWidth = '800px';
    } else {
      // Celular - 1 card por linha
      dynamicContent.style.display = 'grid';
      dynamicContent.style.gridTemplateColumns = '1fr';
      dynamicContent.style.gap = '16px';
      dynamicContent.style.maxWidth = '100%';
    }
  }

  // Event Listeners
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = input.value.trim();
    if (code) {
      await sendCodeToWebhook(code);
    } else {
      showError("Por favor, digite um código.");
    }
  });

  toggleCodeBtn.addEventListener("click", toggleCodeVisibility);

  // Listener para redimensionamento da janela
  window.addEventListener('resize', adjustGrid);

  // Event Listeners para o modal
  modal.addEventListener("click", (e) => {
    if (e.target.matches("[data-close]") || e.target.classList.contains('modal-backdrop')) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeModal();
    }
  });
})();


