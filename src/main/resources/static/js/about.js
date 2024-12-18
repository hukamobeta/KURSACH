document.addEventListener('DOMContentLoaded', function() {
    async function loadAuthorInfo() {
        try {
            // В реальном приложении здесь был бы запрос к API
            const authorData = {
                name: "Кукин Максим Юрьевич",
                role: "Full-stack разработчик",
                avatar: "/images/about.jpg",
                bio: `Студент Финансового Университета
                      Разработчик проекта Smart Parking
                      Научный руководитель:
                      к.т.н., доцент 
                      Горшков Кирилл Андреевич
                      `,
                project: {
                    name: "Smart Parking",
                    description: "Система управления парковочными местами с веб-интерфейсом",
                    technologies: [
                        "Java Spring Boot",
                        "PostgreSQL",
                        "JavaScript",
                        "WebSocket",
                        "JWT Authentication"
                    ],
                    features: [
                        "Управление парковочными местами в реальном времени",
                        "Система бронирования",
                        "Аналитика и статистика",
                        "Административная панель"
                    ]
                },
                contacts: {
                    email: "maksimkukin2@gmail.com",
                    github: "https://github.com/hukamobeta",
                    telegram: "@parbf"
                }
            };

            renderAuthorInfo(authorData);
            showToast('Информация об авторе загружена', 'success');
        } catch (error) {
            console.error('Error loading author info:', error);
            showToast('Ошибка при загрузке информации', 'error');
        }
    }

    function renderAuthorInfo(data) {
        const elements = {
            name: document.getElementById('author-name'),
            role: document.getElementById('author-role'),
            avatar: document.getElementById('author-avatar'),
            bio: document.getElementById('author-bio'),
            project: document.getElementById('project-info'),
            contacts: document.getElementById('contacts')
        };

        if (elements.name) elements.name.textContent = data.name;
        if (elements.role) elements.role.textContent = data.role;
        if (elements.avatar) elements.avatar.src = data.avatar;

        if (elements.bio) {
            elements.bio.innerHTML = `
                <h3>О себе</h3>
                <p>${data.bio.split('\n').join('<br>')}</p>
            `;
        }

        if (elements.project) {
            elements.project.innerHTML = `
                <h3>О проекте ${data.project.name}</h3>
                <p>${data.project.description}</p>
                <div class="tech-stack">
                    <h4>Технологии</h4>
                    <div class="tags">
                        ${data.project.technologies.map(tech => 
                            `<span class="tag">${tech}</span>`
                        ).join('')}
                    </div>
                </div>
                <div class="features">
                    <h4>Основной функционал</h4>
                    <ul>
                        ${data.project.features.map(feature =>
                            `<li>${feature}</li>`
                        ).join('')}
                    </ul>
                </div>
            `;
        }

        if (elements.contacts) {
            elements.contacts.innerHTML = `
                <h3>Контакты</h3>
                <div class="contact-links">
                    <a href="mailto:${data.contacts.email}" class="contact-link">
                        <i class="fas fa-envelope"></i> ${data.contacts.email}
                    </a>
                    <a href="${data.contacts.github}" target="_blank" class="contact-link">
                        <i class="fab fa-github"></i> GitHub
                    </a>
                    <a href="https://t.me/${data.contacts.telegram.substring(1)}" 
                       target="_blank" class="contact-link">
                        <i class="fab fa-telegram"></i> Telegram
                    </a>
                </div>
            `;
        }
    }

    if (document.getElementById('about-view')) {
        loadAuthorInfo();
    }

    window.loadAuthorInfo = loadAuthorInfo;
});