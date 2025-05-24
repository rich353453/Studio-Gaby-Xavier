// Elementos do DOM
document.addEventListener('DOMContentLoaded', function() {
    const bookingButtons = document.querySelectorAll('[data-booking]');
    const bookingModal = document.querySelector('.booking-modal');
    const closeModal = document.querySelector('.close-modal');
    const bookingForm = document.querySelector('.booking-form');
    const calendarGrid = document.querySelector('.calendar-grid');
    const timeSlots = document.querySelector('.time-slots');
    const prevMonthBtn = document.querySelector('.prev-month');
    const nextMonthBtn = document.querySelector('.next-month');
    const calendarTitle = document.querySelector('.calendar-title');
    const backToCalendarBtn = document.querySelector('.back-to-calendar');

    // Estado do calendário
    let currentDate = new Date();
    let selectedDate = null;
    let selectedTime = null;

    // Configuração do calendário
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // Horários disponíveis (9h às 19h, intervalos de 30min)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour < 19; hour++) {
            for (let minutes of ['00', '30']) {
                slots.push(`${hour.toString().padStart(2, '0')}:${minutes}`);
            }
        }
        return slots;
    };

    // Renderizar calendário
    function renderCalendar() {
        if (!calendarGrid) return;
        
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

        calendarTitle.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        calendarGrid.innerHTML = '';

        // Dias do mês anterior
        for (let i = firstDay.getDay(); i > 0; i--) {
            const day = prevMonthLastDay.getDate() - i + 1;
            const dayElement = createDayElement(day, true);
            calendarGrid.appendChild(dayElement);
        }

        // Dias do mês atual
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayElement = createDayElement(day, false);
            calendarGrid.appendChild(dayElement);
        }

        // Dias do próximo mês
        const remainingDays = 42 - calendarGrid.children.length;
        for (let day = 1; day <= remainingDays; day++) {
            const dayElement = createDayElement(day, true);
            calendarGrid.appendChild(dayElement);
        }
    }

    // Criar elemento de dia
    function createDayElement(day, disabled) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const today = new Date();
        const isToday = day === today.getDate() && 
                       currentDate.getMonth() === today.getMonth() && 
                       currentDate.getFullYear() === today.getFullYear();
        
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        if (disabled) {
            dayElement.classList.add('disabled');
        } else {
            dayElement.addEventListener('click', () => selectDate(day));
        }

        return dayElement;
    }

    // Selecionar data
    function selectDate(day) {
        const selectedDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        
        // Remover seleção anterior
        const previousSelected = document.querySelector('.calendar-day.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }

        // Adicionar nova seleção
        const dayElement = Array.from(document.querySelectorAll('.calendar-day:not(.disabled)'))
            .find(el => parseInt(el.textContent) === day);
        if (dayElement) {
            dayElement.classList.add('selected');
            selectedDate = selectedDay;
            // Atualizar campo de data
            const dateInput = document.querySelector('#date');
            if (dateInput) {
                dateInput.value = selectedDay.toLocaleDateString();
            }
            renderTimeSlots();
        }
    }

    // Renderizar horários
    function renderTimeSlots() {
        if (!timeSlots) return;
        
        timeSlots.innerHTML = '';
        const slots = generateTimeSlots();

        slots.forEach(time => {
            const timeElement = document.createElement('div');
            timeElement.className = 'time-slot';
            timeElement.textContent = time;
            timeElement.addEventListener('click', () => selectTime(time, timeElement));
            timeSlots.appendChild(timeElement);
        });
    }

    // Selecionar horário
    function selectTime(time, element) {
        const previousSelected = document.querySelector('.time-slot.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }

        element.classList.add('selected');
        selectedTime = time;
        
        // Atualizar campo de horário
        const timeInput = document.querySelector('#time');
        if (timeInput) {
            timeInput.value = time;
        }
        
        // Mostrar formulário
        if (bookingForm) {
            // Remover qualquer formulário ativo anterior
            const activeForm = document.querySelector('.booking-form.active');
            if (activeForm) {
                activeForm.classList.remove('active');
            }
            
            // Mostrar o formulário atual
            bookingForm.style.display = 'block';
            requestAnimationFrame(() => {
                bookingForm.classList.add('active');
            });
        }
    }

    // Inicializar eventos dos botões de agendamento
    if (bookingButtons) {
        bookingButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão de agendamento clicado');
                
                const service = button.getAttribute('data-service');
                if (service) {
                    const serviceSelect = document.querySelector('select[name="service"]');
                    if (serviceSelect) {
                        serviceSelect.value = service;
                    }
                }
                
                if (bookingModal) {
                    // Resetar o estado do formulário
                    if (bookingForm) {
                        bookingForm.reset();
                        bookingForm.style.display = 'none';
                        bookingForm.classList.remove('active');
                    }
                    
                    bookingModal.style.display = 'flex';
                    bookingModal.classList.add('active');
                    renderCalendar();
                } else {
                    console.error('Modal não encontrado');
                }
            });
        });
    }

    // Evento de fechar modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (bookingModal) {
                bookingModal.classList.remove('active');
                setTimeout(() => {
                    bookingModal.style.display = 'none';
                    // Resetar seleções
                    const selectedDay = document.querySelector('.calendar-day.selected');
                    if (selectedDay) {
                        selectedDay.classList.remove('selected');
                    }
                    const selectedTimeSlot = document.querySelector('.time-slot.selected');
                    if (selectedTimeSlot) {
                        selectedTimeSlot.classList.remove('selected');
                    }
                    selectedDate = null;
                    selectedTime = null;
                }, 300);
            }
            if (bookingForm) {
                bookingForm.classList.remove('active');
                bookingForm.reset();
                setTimeout(() => {
                    bookingForm.style.display = 'none';
                }, 300);
            }
        });
    }

    // Fechar modal ao clicar fora
    if (bookingModal) {
        bookingModal.addEventListener('click', (e) => {
            if (e.target === bookingModal) {
                bookingModal.classList.remove('active');
                setTimeout(() => {
                    bookingModal.style.display = 'none';
                }, 300);
                if (bookingForm) {
                    bookingForm.classList.remove('active');
                    setTimeout(() => {
                        bookingForm.style.display = 'none';
                    }, 300);
                }
            }
        });
    }

    // Navegação do calendário
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    // Botão voltar para calendário
    if (backToCalendarBtn) {
        backToCalendarBtn.addEventListener('click', () => {
            if (bookingForm) {
                bookingForm.classList.remove('active');
                setTimeout(() => {
                    bookingForm.style.display = 'none';
                }, 300);
            }
        });
    }

    // Submissão do formulário
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!selectedDate || !selectedTime) {
                alert('Por favor, selecione uma data e horário.');
                return;
            }

            const formData = new FormData(bookingForm);
            const service = formData.get('service');
            const name = formData.get('name');
            const phone = formData.get('phone');
            const notes = formData.get('notes');
            
            // Criar o objeto com os dados do agendamento
            const bookingData = {
                service: service,
                name: name,
                phone: phone,
                date: selectedDate.toLocaleDateString(),
                time: selectedTime,
                notes: notes || 'Nenhuma observação'
            };

            try {
                // Mostrar mensagem de carregamento
                const submitButton = bookingForm.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                submitButton.textContent = 'Processando...';
                submitButton.disabled = true;

                // Preparar mensagem do WhatsApp
                const message = formatWhatsAppMessage(bookingData);
                const phoneNumber = '5511973119019';
                const whatsappURL = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;

                // Restaurar botão
                submitButton.textContent = originalText;
                submitButton.disabled = false;

                // Redirecionar para o WhatsApp
                window.open(whatsappURL, '_blank');

                // Fechar o modal após o redirecionamento
                if (bookingModal) {
                    bookingModal.classList.remove('active');
                    setTimeout(() => {
                        bookingModal.style.display = 'none';
                        // Resetar formulário
                        bookingForm.reset();
                        // Limpar seleções
                        const selectedDay = document.querySelector('.calendar-day.selected');
                        if (selectedDay) {
                            selectedDay.classList.remove('selected');
                        }
                        const selectedTimeSlot = document.querySelector('.time-slot.selected');
                        if (selectedTimeSlot) {
                            selectedTimeSlot.classList.remove('selected');
                        }
                        selectedDate = null;
                        selectedTime = null;
                    }, 300);
                }

            } catch (error) {
                console.error('Erro ao processar agendamento:', error);
                alert('Ocorreu um erro ao processar seu agendamento. Por favor, tente novamente.');
                
                // Restaurar botão em caso de erro
                const submitButton = bookingForm.querySelector('button[type="submit"]');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }
});

// Carrossel de Vídeos
document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');
    const dotsContainer = document.querySelector('.carousel-dots');
    
    let currentIndex = 0;
    const slideWidth = 100; // Porcentagem

    // Criar dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.carousel-dot');

    // Atualizar dots
    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    // Ir para slide específico
    function goToSlide(index) {
        currentIndex = index;
        track.style.transform = `translateX(-${index * slideWidth}%)`;
        updateDots();
    }

    // Event listeners para os botões
    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        goToSlide(currentIndex);
    });

    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % slides.length;
        goToSlide(currentIndex);
    });

    // Autoplay
    let autoplayInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % slides.length;
        goToSlide(currentIndex);
    }, 5000);

    // Pausar autoplay quando o mouse estiver sobre o carrossel
    const carousel = document.querySelector('.carousel-container');
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoplayInterval);
    });

    carousel.addEventListener('mouseleave', () => {
        autoplayInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % slides.length;
            goToSlide(currentIndex);
        }, 5000);
    });

    // Swipe support para dispositivos móveis
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    carousel.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe para esquerda
                currentIndex = (currentIndex + 1) % slides.length;
            } else {
                // Swipe para direita
                currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            }
            goToSlide(currentIndex);
        }
    }
});

// Função para formatar o número de telefone
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
}

// Função para formatar data
function formatDate(date) {
    const [day, month, year] = date.split('/');
    const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dateObj = new Date(year, month - 1, day);
    const weekDay = weekDays[dateObj.getDay()];
    return `${weekDay}, ${day}/${month}/${year}`;
}

// Função para formatar preço
function formatPrice(service) {
    const prices = {
        'Design de Sobrancelhas': 'R$ 50,00',
        'Peeling Facial': 'R$ 80,00',
        'Massagem Rejuvenescedora': 'R$ 100,00'
    };
    return prices[service] || '';
}

// Função para formatar a mensagem do WhatsApp
function formatWhatsAppMessage(formData) {
    const formattedDate = formatDate(formData.date);
    const formattedPhone = formatPhoneNumber(formData.phone);
    
    return encodeURIComponent(`
✨ *NOVO AGENDAMENTO - STUDIO GABY XAVIER* ✨

📅 *Data:* ${formattedDate}
⏰ *Horário:* ${formData.time}
💆‍♀️ *Serviço:* ${formData.service}
💰 *Valor:* ${formatPrice(formData.service)}

👤 *DADOS DO CLIENTE:*
📋 Nome: ${formData.name}
📱 Telefone: ${formattedPhone}
${formData.notes ? `\n📝 *OBSERVAÇÕES:*\n${formData.notes}` : ''}

-------------------
Aguardando sua confirmação!
`);
}

document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.querySelector('.booking-form');
    const phoneInput = document.getElementById('phone');
    
    // Máscara para o telefone
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
            }
            e.target.value = value;
        });
    }
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validações
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const service = document.getElementById('service').value;
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            
            if (name.length < 3) {
                alert('Por favor, insira seu nome completo');
                return;
            }
            
            if (!phone.match(/^\(\d{2}\) \d{5}-\d{4}$/)) {
                alert('Por favor, insira um número de telefone válido');
                return;
            }
            
            if (!service || !date || !time) {
                alert('Por favor, preencha todos os campos obrigatórios');
                return;
            }

            const formData = {
                name,
                phone,
                service,
                date,
                time,
                notes: document.getElementById('notes').value.trim()
            };

            try {
                // Mostrar mensagem de carregamento
                const submitButton = bookingForm.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                submitButton.textContent = 'Processando...';
                submitButton.disabled = true;

                // Enviar email usando EmailJS
                await emailjs.send(
                    "SEU_SERVICE_ID", // Substitua pelo seu Service ID
                    "SEU_TEMPLATE_ID", // Substitua pelo seu Template ID
                    {
                        to_email: "richardsuportelukos@gmail.com",
                        from_name: name,
                        service: service,
                        date: date,
                        time: time,
                        phone: phone,
                        notes: formData.notes,
                        price: formatPrice(service)
                    }
                );

                // Preparar mensagem do WhatsApp
                const message = formatWhatsAppMessage(formData);
                const phoneNumber = '5511973119019';
                const whatsappURL = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;

                // Restaurar botão
                submitButton.textContent = originalText;
                submitButton.disabled = false;

                // Mostrar mensagem de sucesso e redirecionar
                alert('Agendamento realizado com sucesso! Você será conectado ao WhatsApp para confirmar os detalhes.');
                window.open(whatsappURL, '_blank');

            } catch (error) {
                console.error('Erro ao processar agendamento:', error);
                alert('Ocorreu um erro ao processar seu agendamento. Por favor, tente novamente.');
                
                // Restaurar botão em caso de erro
                const submitButton = bookingForm.querySelector('button[type="submit"]');
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }
});

// Animações no scroll
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.servico-card, .info-item, .stat-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px)';
        element.style.transition = 'all 0.6s ease-out';
        observer.observe(element);
    });

    // Smooth scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Parallax suave no hero
    const hero = document.querySelector('.hero');
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        if (hero) {
            hero.style.backgroundPositionY = scrolled * 0.5 + 'px';
        }
    });

    // Animação do menu ativo
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const menuLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
            
            if (menuLink && scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                menuLink.classList.add('active');
            } else if (menuLink) {
                menuLink.classList.remove('active');
            }
        });
    });
});

// Controle de scroll da navegação
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');

    // Função para atualizar a navegação no scroll
    function updateNavigation() {
        const scrollY = window.pageYOffset;

        // Adiciona classe scrolled na navbar quando rolar a página
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Atualiza o link ativo baseado na seção visível
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Adiciona o evento de scroll
    window.addEventListener('scroll', updateNavigation);

    // Smooth scroll para links internos
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#') && !this.hasAttribute('data-booking')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});

// Navbar scroll behavior
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scroll for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            } else if (this.getAttribute('href') === '#') {
                // Scroll to top for home link
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        });
    });
}); 