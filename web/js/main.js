import fetchData from './api.js';

const showError = (message) => {
    const existing = document.querySelector('.error-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = message;
    document.querySelector('main').prepend(notification);
};

const renderEmployees = (data) => {
    const tableBody = document.querySelector('.data-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    const employees = data.results || data;
    employees.forEach((emp) => {
        const row = `
            <tr>
                <td>${emp.firstName} ${emp.lastName}</td>
                <td>${emp.phoneNumber}</td>
                <td>${emp.idPosition ? emp.idPosition.positionName : 'Невідомо'}</td>
                <td>${emp.idServiceCenter ? emp.idServiceCenter.name : '-'}</td>
                <td><a href="edit-user.html" class="btn-edit">Редагувати</a></td>
            </tr>`;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
};

const getStatusClass = (statusName) => {
    const mapping = {
        Прийнято: 'info',
        Виконується: 'warning',
        Завершено: 'success',
        Скасовано: 'error',
    };
    return mapping[statusName] || 'default';
};

const renderRepairs = (data) => {
    const tableBody = document.querySelector('.data-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    const repairs = data.results || data;
    repairs.forEach((repair) => {
        const statusName = repair.status;
        const statusClass = getStatusClass(statusName);

        const row = `
            <tr>
                <td>${repair.idCar ? `${repair.idCar.brand} ${repair.idCar.model}` : 'Невідомо'}</td>
                <td><strong>${repair.idCar ? repair.idCar.licensePlate : '-'}</strong></td>
                <td>${repair.idServiceCenter ? repair.idServiceCenter.name : '-'}</td>
                <td>
                    <span class="status-badge ${statusClass}">${statusName}</span>
                </td>
                <td><button class="btn-edit">Деталі</button></td>
            </tr>`;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
};

const renderCenters = (data) => {
    const tableBody = document.querySelector('.data-table tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    const centers = data.results || data;
    centers.forEach((center) => {
        const row = `
            <tr>
                <td>${center.name}</td>
                <td>${center.address}</td>
                <td>${center.phoneNumber}</td>
                <td><button class="btn-edit">Редагувати</button></td>
            </tr>`;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
};

const loadSelectOptions = async (endpoint, selectId, valueKey, textFormatter) => {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return;

    try {
        const data = await fetchData(endpoint);
        const items = data.results || data;

        selectElement.innerHTML = '<option value="" disabled selected>Оберіть варіант...</option>';

        items.forEach((item) => {
            const option = document.createElement('option');
            option.value = item[valueKey];
            option.textContent = typeof textFormatter === 'function' ? textFormatter(item) : item[textFormatter];
            selectElement.appendChild(option);
        });
    } catch (error) {
        selectElement.innerHTML = '<option value="" disabled>Помилка завантаження</option>';
    }
};

const initCreateEmployeeForm = async () => {
    const form = document.querySelector('.create-user-form');
    if (!form) return;

    const cancelBtn = document.querySelector('.btn-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.history.back();
        });
    }

    await Promise.all([
        loadSelectOptions('/positions/', 'role', 'idPosition', 'positionName'),
        loadSelectOptions('/service-centers/', 'service-center', 'idServiceCenter', (item) => `${item.name} (${item.address})`),
    ]);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const fullName = document.getElementById('full_name').value.trim();
        const nameParts = fullName.split(' ');

        const newEmployee = {
            username: document.getElementById('username').value,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            phoneNumber: document.getElementById('phone').value,
            idPosition: parseInt(document.getElementById('role').value, 10),
            idServiceCenter: parseInt(document.getElementById('service-center').value, 10),
        };
        try {
            await fetchData('/employees/', {
                method: 'POST',
                body: JSON.stringify(newEmployee),
            });
            window.location.href = 'users.html';
        } catch (error) {
            showError('Помилка при створенні працівника. Спробуйте ще раз.');
        }
    });
};

const initAddEmployeeButton = () => {
    const addBtn = document.querySelector('.btn-add-employee');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            window.location.href = 'create-user.html';
        });
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const { pathname } = window.location;

    initAddEmployeeButton();

    try {
        if (pathname.includes('users.html')) {
            const data = await fetchData('/employees/');
            renderEmployees(data);
        } else if (pathname.includes('repairs.html')) {
            const data = await fetchData('/repairs/');
            renderRepairs(data);
        } else if (pathname.includes('centers.html')) {
            const data = await fetchData('/service-centers/');
            renderCenters(data);
        } else if (pathname.includes('create-user.html')) {
            initCreateEmployeeForm();
        }
    } catch (error) {
        showError('Не вдалося завантажити дані. Перевірте підключення до сервера.');
    }
});
