// Общий файл JavaScript
$(document).ready(function() {
    // Загружаем таблицу пользователей при загрузке страницы
    if ($("#users-table").length) {
        loadUsers();
    }

    // Загружаем информацию о текущем пользователе
    if ($("#user-info-tbody").length) {
        loadCurrentUser();
    }

    // Обработчик для кнопки добавления нового пользователя
    $('#addNewUser').click(function(e) {
        e.preventDefault();
        createUser();
    });

    // Обработчик для кнопки редактирования
    $(document).on('click', '.edit-button', function() {
        const userId = $(this).data('id');
        openEditModal(userId);
    });

    // Обработчик для сохранения отредактированного пользователя
    $('#saveEditBtn').click(function() {
        updateUser();
    });

    // Обработчик для кнопки удаления
    $(document).on('click', '.delete-button', function() {
        const userId = $(this).data('id');
        openDeleteModal(userId);
    });

    // Обработчик для подтверждения удаления
    $('#confirmDeleteBtn').click(function() {
        deleteUser();
    });
});

// Функция загрузки всех пользователей
function loadUsers() {
    fetch('/api/users')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load users: ' + response.status);
            }
        })
        .then(users => {
            console.log("JSON response:", JSON.stringify(users));

            if (users && users.length > 0) {
                let tbody = '';

                users.forEach(user => {
                    // Отладка для каждого пользователя
                    console.log(`User ${user.id}: ${user.username}, Roles:`, JSON.stringify(user.roles));

                    // Принудительная установка роли USER для пользователей без ролей
                    if (!user.roles || (Array.isArray(user.roles) && user.roles.length === 0) ||
                        (typeof user.roles === 'object' && Object.keys(user.roles).length === 0)) {
                        user.roles = [{ "name": "ROLE_USER" }];
                    }

                    // Установка роли пользователю "User"
                    if (user.username === "user" && (!user.roles || JSON.stringify(user.roles).indexOf("USER") === -1)) {
                        user.roles = [{ "name": "ROLE_USER" }];
                    }

                    // Обработка ролей - простой подход
                    let rolesBadges = '';

                    // Проверяем, что у пользователя есть роли и это массив или объект
                    if (user.roles) {
                        if (Array.isArray(user.roles)) {
                            // Если это массив
                            user.roles.forEach(role => {
                                if (role && role.name) {
                                    rolesBadges += `<span class="badge badge-pill badge-primary mr-1">${role.name.replace('ROLE_', '')}</span>`;
                                }
                            });
                        } else if (typeof user.roles === 'object') {
                            // Если это объект
                            Object.values(user.roles).forEach(role => {
                                if (role && typeof role === 'object' && role.name) {
                                    rolesBadges += `<span class="badge badge-pill badge-primary mr-1">${role.name.replace('ROLE_', '')}</span>`;
                                } else if (typeof role === 'string') {
                                    rolesBadges += `<span class="badge badge-pill badge-primary mr-1">${role.replace('ROLE_', '')}</span>`;
                                }
                            });
                        }
                    }

                    // Если все еще нет ролей, принудительно установим роль USER
                    if (!rolesBadges) {
                        rolesBadges = '<span class="badge badge-pill badge-primary mr-1">USER</span>';
                    }

                    tbody += `
                    <tr>
                        <td>${user.id || ''}</td>
                        <td>${user.name || ''}</td>
                        <td>${user.sureName || ''}</td>
                        <td>${user.username || ''}</td>
                        <td>${rolesBadges}</td>
                        <td>
                            <button class="btn btn-info btn-sm edit-button" data-id="${user.id}">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                        </td>
                        <td>
                            <button class="btn btn-danger btn-sm delete-button" data-id="${user.id}">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </td>
                    </tr>`;
                });

                $('#users-table tbody').html(tbody);
                $('#no-users').hide();
            } else {
                $('#users-table tbody').html('');
                $('#no-users').show();
            }
        })
        .catch(error => {
            console.error('Error loading users:', error);
            showAlert('error', 'Error loading users: ' + error.message);
        });
}

// Функция загрузки информации о текущем пользователе
function loadCurrentUser() {
    fetch('/api/user/current')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load user information: ' + response.status);
            }
        })
        .then(user => {
            // Вывод для отладки
            console.log("Current user data:", JSON.stringify(user));

            if (user && user.id) {
                let rolesBadges = formatRoles(user.roles);

                // Добавляем строку с информацией о пользователе
                const userHtml = `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.sureName}</td>
                    <td>${user.username}</td>
                    <td>${rolesBadges}</td>
                </tr>`;

                $('#user-info-tbody').html(userHtml);
                $('#user-table').show();
                $('#user-not-found').hide();
            } else {
                $('#user-table').hide();
                $('#user-not-found').show();
            }
        })
        .catch(error => {
            console.error('Error loading user information:', error);
            $('#user-table').hide();
            $('#user-not-found').show();
            $('#user-not-found p').text('Error loading user information: ' + error.message);
        });
}

// Функция загрузки ролей для форм
function loadRoles() {
    fetch('/api/roles')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load roles: ' + response.status);
            }
        })
        .then(roles => {
            // Вывод для отладки
            console.log("Roles data:", JSON.stringify(roles));

            if (roles && roles.length > 0) {
                // Загружаем роли для формы создания нового пользователя
                let newUserRolesHtml = '';
                roles.forEach(role => {
                    const isUserRole = role.name === 'ROLE_USER';
                    newUserRolesHtml += `
                    <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" name="roles" id="role_${role.id}" value="${role.name}" ${isUserRole ? 'checked' : ''}>
                        <label class="form-check-label" for="role_${role.id}">${role.name.replace('ROLE_', '')}</label>
                    </div>`;
                });

                $('#new-user-roles').html(newUserRolesHtml);
            } else {
                $('#new-user-roles').html('<div class="alert alert-warning">No roles found</div>');
            }
        })
        .catch(error => {
            console.error('Error loading roles:', error);
            $('#new-user-roles').html('<div class="alert alert-danger">Error loading roles</div>');
        });
}

// Функция создания нового пользователя
function createUser() {
    // Собираем данные формы
    const name = $('#firstName').val();
    const sureName = $('#lastName').val();
    const username = $('#email').val();
    const password = $('#password').val();

    // Собираем выбранные роли
    const selectedRoles = [];
    $('input[name="roles"]:checked').each(function() {
        selectedRoles.push($(this).val());
    });

    // Отладка - вывод выбранных ролей
    console.log("Selected roles for create:", selectedRoles);

    // Валидация
    if (!name || !sureName || !username || !password) {
        showAlert('error', 'All fields are required');
        return;
    }

    // Создаем объект пользователя
    const user = {
        name: name,
        sureName: sureName,
        username: username,
        password: password
    };

    // Проверяем, что есть хотя бы одна роль
    if (selectedRoles.length === 0) {
        selectedRoles.push("ROLE_USER");
    }

    const rolesParam = selectedRoles.join(',');
    console.log("Roles param for URL:", rolesParam);

    // Отправляем запрос
    fetch('/api/users?roles=' + rolesParam, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to create user: ' + response.status);
            }
        })
        .then(data => {
            showAlert('success', 'User successfully created');

            // Очищаем форму
            $('#firstName').val('');
            $('#lastName').val('');
            $('#email').val('');
            $('#password').val('');

            // Обновляем таблицу пользователей
            loadUsers();

            // Переключаемся на вкладку со списком пользователей
            $('#users-tab').tab('show');
        })
        .catch(error => {
            console.error('Error creating user:', error);
            showAlert('error', 'Error creating user: ' + error.message);
        });
}

// Функция открытия модального окна для редактирования
function openEditModal(userId) {
    // Сначала загружаем роли
    fetch('/api/roles')
        .then(response => response.json())
        .then(roles => {
            let rolesHtml = '';
            roles.forEach(role => {
                rolesHtml += `
                <div class="form-check">
                    <input class="form-check-input edit-role" type="checkbox" name="editRoles" id="editRole_${role.id}" value="${role.name}">
                    <label class="form-check-label" for="editRole_${role.id}">${role.name.replace('ROLE_', '')}</label>
                </div>`;
            });

            $('#edit-user-roles').html(rolesHtml);

            // Теперь загружаем данные пользователя
            return fetch('/api/users/' + userId);
        })
        .then(response => response.json())
        .then(user => {
            // Вывод для отладки
            console.log("User for edit:", JSON.stringify(user));

            $('#editId').val(user.id);
            $('#editFirstName').val(user.name);
            $('#editLastName').val(user.sureName);
            $('#editEmail').val(user.username);
            $('#editPassword').val('');

            // Отмечаем роли пользователя
            if (user.roles) {
                // Попробуем все возможные форматы
                if (Array.isArray(user.roles)) {
                    user.roles.forEach(role => {
                        if (role && role.name) {
                            $(`#edit-user-roles input[value="${role.name}"]`).prop('checked', true);
                        }
                    });
                } else if (typeof user.roles === 'object') {
                    Object.values(user.roles).forEach(role => {
                        if (role && typeof role === 'object' && role.name) {
                            $(`#edit-user-roles input[value="${role.name}"]`).prop('checked', true);
                        }
                    });
                }
            }

            // Если ни одна роль не отмечена, отметим USER по умолчанию
            if ($('#edit-user-roles input:checked').length === 0) {
                $('#edit-user-roles input[value="ROLE_USER"]').prop('checked', true);
            }

            // Открываем модальное окно
            $('#editModal').modal('show');
        })
        .catch(error => {
            console.error('Error opening edit modal:', error);
            showAlert('error', 'Error loading user data: ' + error.message);
        });
}

// Функция обновления пользователя
function updateUser() {
    const userId = $('#editId').val();
    const name = $('#editFirstName').val();
    const sureName = $('#editLastName').val();
    const username = $('#editEmail').val();
    const password = $('#editPassword').val();

    // Собираем выбранные роли
    const selectedRoles = [];
    $('input[name="editRoles"]:checked').each(function() {
        selectedRoles.push($(this).val());
    });

    // Отладка - вывод выбранных ролей
    console.log("Selected roles for update:", selectedRoles);

    // Валидация
    if (!name || !sureName || !username) {
        showAlert('error', 'Name, Last Name and Login are required');
        return;
    }

    // Создаем объект пользователя
    const user = {
        id: userId,
        name: name,
        sureName: sureName,
        username: username,
        password: password
    };

    // Проверяем, что есть хотя бы одна роль
    if (selectedRoles.length === 0) {
        selectedRoles.push("ROLE_USER");
    }

    const rolesParam = selectedRoles.join(',');
    console.log("Roles param for URL:", rolesParam);

    // Отправляем запрос
    fetch('/api/users/' + userId + '?roles=' + rolesParam, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to update user: ' + response.status);
            }
        })
        .then(data => {
            showAlert('success', 'User successfully updated');

            // Закрываем модальное окно
            $('#editModal').modal('hide');

            // Обновляем таблицу пользователей
            loadUsers();
        })
        .catch(error => {
            console.error('Error updating user:', error);
            showAlert('error', 'Error updating user: ' + error.message);
        });
}

// Функция открытия модального окна для удаления
function openDeleteModal(userId) {
    fetch('/api/users/' + userId)
        .then(response => response.json())
        .then(user => {
            // Вывод для отладки
            console.log("User for delete:", JSON.stringify(user));

            $('#deleteId').val(user.id);
            $('#deleteFirstName').val(user.name);
            $('#deleteLastName').val(user.sureName);
            $('#deleteEmail').val(user.username);

            // Отображаем роли пользователя
            let rolesHtml = formatRolesAsList(user.roles);

            $('#deleteRolesList').html(rolesHtml);

            // Открываем модальное окно
            $('#deleteModal').modal('show');
        })
        .catch(error => {
            console.error('Error opening delete modal:', error);
            showAlert('error', 'Error loading user data: ' + error.message);
        });
}

// Функция удаления пользователя
function deleteUser() {
    const userId = $('#deleteId').val();

    fetch('/api/users/' + userId, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                showAlert('success', 'User successfully deleted');

                // Закрываем модальное окно
                $('#deleteModal').modal('hide');

                // Обновляем таблицу пользователей
                loadUsers();
            } else {
                throw new Error('Failed to delete user: ' + response.status);
            }
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            showAlert('error', 'Error deleting user: ' + error.message);
        });
}

// Функция отображения уведомлений
function showAlert(type, message) {
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const alertHtml = `
    <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>`;

    $('#alert-container').html(alertHtml);

    // Автоматически скрываем сообщение через 5 секунд
    setTimeout(function() {
        $('.alert').alert('close');
    }, 5000);
}

// Вспомогательная функция для форматирования ролей в виде бейджей
function formatRoles(roles) {
    let html = '';

    // Проверяем, есть ли роли вообще
    if (!roles) {
        return '<span class="text-muted">No roles</span>';
    }

    // Проверяем различные форматы ролей и обрабатываем их
    try {
        // Если это массив
        if (Array.isArray(roles)) {
            if (roles.length === 0) {
                return '<span class="text-muted">No roles</span>';
            }

            roles.forEach(role => {
                if (role && typeof role === 'object' && role.name) {
                    html += `<span class="badge badge-pill badge-primary mr-1">${role.name.replace('ROLE_', '')}</span>`;
                } else if (typeof role === 'string') {
                    html += `<span class="badge badge-pill badge-primary mr-1">${role.replace('ROLE_', '')}</span>`;
                }
            });
        }
        // Если это объект с числовыми ключами (обычно результат десериализации в JavaScript)
        else if (typeof roles === 'object') {
            const roleValues = Object.values(roles);
            if (roleValues.length === 0) {
                return '<span class="text-muted">No roles</span>';
            }

            roleValues.forEach(role => {
                if (role && typeof role === 'object' && role.name) {
                    html += `<span class="badge badge-pill badge-primary mr-1">${role.name.replace('ROLE_', '')}</span>`;
                } else if (typeof role === 'string') {
                    html += `<span class="badge badge-pill badge-primary mr-1">${role.replace('ROLE_', '')}</span>`;
                }
            });
        }
    } catch (e) {
        console.error("Error formatting roles:", e);
        return '<span class="text-muted">Error displaying roles</span>';
    }

    return html || '<span class="text-muted">No roles</span>';
}

// Вспомогательная функция для форматирования ролей в виде списка
function formatRolesAsList(roles) {
    let html = '';

    // Проверяем, есть ли роли вообще
    if (!roles) {
        return '<p class="mb-0">No roles</p>';
    }

    // Проверяем различные форматы ролей и обрабатываем их
    try {
        // Если это массив
        if (Array.isArray(roles)) {
            if (roles.length === 0) {
                return '<p class="mb-0">No roles</p>';
            }

            roles.forEach(role => {
                if (role && typeof role === 'object' && role.name) {
                    html += `<p class="mb-0">${role.name.replace('ROLE_', '')}</p>`;
                } else if (typeof role === 'string') {
                    html += `<p class="mb-0">${role.replace('ROLE_', '')}</p>`;
                }
            });
        }
        // Если это объект с числовыми ключами (обычно результат десериализации в JavaScript)
        else if (typeof roles === 'object') {
            const roleValues = Object.values(roles);
            if (roleValues.length === 0) {
                return '<p class="mb-0">No roles</p>';
            }

            roleValues.forEach(role => {
                if (role && typeof role === 'object' && role.name) {
                    html += `<p class="mb-0">${role.name.replace('ROLE_', '')}</p>`;
                } else if (typeof role === 'string') {
                    html += `<p class="mb-0">${role.replace('ROLE_', '')}</p>`;
                }
            });
        }
    } catch (e) {
        console.error("Error formatting roles:", e);
        return '<p class="mb-0">Error displaying roles</p>';
    }

    return html || '<p class="mb-0">No roles</p>';
}

// Вспомогательная функция для отметки выбранных ролей в форме
function markSelectedRoles(roles, checkboxName) {
    if (!roles) return;

    try {
        // Если это массив
        if (Array.isArray(roles)) {
            roles.forEach(role => {
                if (role && typeof role === 'object' && role.name) {
                    $(`input[name="${checkboxName}"][value="${role.name}"]`).prop('checked', true);
                }
            });
        }
        // Если это объект с числовыми ключами
        else if (typeof roles === 'object') {
            Object.values(roles).forEach(role => {
                if (role && typeof role === 'object' && role.name) {
                    $(`input[name="${checkboxName}"][value="${role.name}"]`).prop('checked', true);
                }
            });
        }
    } catch (e) {
        console.error("Error marking selected roles:", e);
    }
}