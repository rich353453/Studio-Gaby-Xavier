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
        if (bookingForm) {
            bookingForm.style.display = 'flex';
            bookingForm.classList.add('active');
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
                }, 300);
            }
            if (bookingForm) {
                bookingForm.classList.remove('active');
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
            const bookingData = {
                ...Object.fromEntries(formData),
                date: selectedDate.toLocaleDateString(),
                time: selectedTime
            };
            
            console.log('Dados do agendamento:', bookingData);
            
            alert('Agendamento realizado com sucesso! Entraremos em contato para confirmar.');
            bookingModal.classList.remove('active');
            setTimeout(() => {
                bookingModal.style.display = 'none';
            }, 300);
            bookingForm.classList.remove('active');
            setTimeout(() => {
                bookingForm.style.display = 'none';
            }, 300);
            bookingForm.reset();
        });
    }
}); 