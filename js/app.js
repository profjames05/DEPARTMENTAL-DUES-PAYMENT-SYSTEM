(function () {
  const routeMap = {
    student: 'student-dashboard.html',
    treasurer: 'treasurer-dashboard.html',
    admin: 'administrator-dashboard.html'
  };

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 2 }).format(Number(amount || 0));
  }

  function formatDate(value) {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function genId(prefix) {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  function genReference() {
    return 'UENR-TRX-' + Math.floor(100000 + Math.random() * 900000);
  }

  function esc(value) {
    return window.UENRValidation ? window.UENRValidation.escapeHtml(value) : String(value || '');
  }

  function toast(message, tone = 'success') {
    if (window.showToast) {
      window.showToast(message, tone);
      return;
    }
    const existing = document.getElementById('uenr-toast');
    const node = document.createElement('div');
    node.id = 'uenr-toast';
    node.className = `toast toast-${tone}`;
    node.textContent = message;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2500);
  }

  function bindRoleTabs() {
    const tabs = document.querySelectorAll('[data-role-button]');
    const input = document.getElementById('loginRole');
    const prompt = document.getElementById('createAccountPrompt');
    const link = document.getElementById('createAccountLink');
    if (!tabs.length || !input) return;

    const updateRoleView = (role) => {
      tabs.forEach((el) => el.classList.toggle('active', el.dataset.roleButton === role));
      input.value = role;
      if (prompt) {
        const labels = {
          student: 'New student?',
          treasurer: 'New treasurer?',
          admin: 'New administrator?'
        };
        prompt.textContent = labels[role] || 'New student?';
      }
      if (link) {
        const textMap = {
          student: 'Create student account',
          treasurer: 'Create treasurer account',
          admin: 'Create administrator account'
        };
        link.textContent = textMap[role] || 'Create account';
        link.href = `register.html?role=${role}`;
      }
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => updateRoleView(tab.dataset.roleButton));
    });

    updateRoleView(input.value || 'student');
  }

  function bindPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach((button) => {
      button.addEventListener('click', () => {
        const input = document.getElementById(button.dataset.toggle);
        if (!input) return;
        const nextType = input.type === 'password' ? 'text' : 'password';
        input.type = nextType;
        button.textContent = nextType === 'password' ? 'Show' : 'Hide';
      });
    });
  }

  function handleLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const role = document.getElementById('loginRole').value;
      const user = window.UENRStorage.getUserByEmail(email);

      if (!email || !password) {
        toast('Please enter your email and password.', 'error');
        return;
      }

      if (!user || user.role !== role) {
        toast('This account does not match the selected login role.', 'error');
        return;
      }

      if (user.passwordHash !== window.UENRStorage.hashValue(password)) {
        toast('Invalid email or password.', 'error');
        return;
      }

      window.UENRStorage.setCurrentUser(user);
      toast('Login successful. Redirecting...');
      setTimeout(() => {
        window.location.href = routeMap[role] || 'index.html';
      }, 400);
    });
  }

  function handleRegister() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    const campusSelect = document.getElementById('campusSelect');
    const schoolSelect = document.getElementById('schoolSelect');
    const departmentSelect = document.getElementById('departmentSelect');
    const programmeSelect = document.getElementById('programmeSelect');
    const studentIdField = document.getElementById('studentIdField');
    const staffIdField = document.getElementById('staffIdField');
    const programmeField = document.getElementById('programmeField');
    const academicLevelField = document.getElementById('academicLevelField');
    const academicYearField = document.getElementById('academicYearField');
    const campusField = document.getElementById('campusField');
    const schoolField = document.getElementById('schoolField');
    const departmentField = document.getElementById('departmentField');
    const registerEyebrow = document.getElementById('registerEyebrow');
    const registerTitle = document.getElementById('registerTitle');
    const roleButtons = document.querySelectorAll('[data-register-role]');
    const defaultRole = new URLSearchParams(window.location.search).get('role') || 'student';

    function setRole(role) {
      const isStudent = role === 'student';
      const titleMap = {
        student: 'student',
        treasurer: 'treasurer',
        admin: 'administrator'
      };
      const displayRole = titleMap[role] || 'student';
      roleButtons.forEach((button) => {
        const active = button.dataset.registerRole === role;
        button.classList.toggle('active', active);
      });

      if (registerEyebrow) registerEyebrow.textContent = isStudent ? 'New student' : `New ${displayRole}`;
      if (registerTitle) registerTitle.textContent = isStudent ? 'Create your account' : `Create ${displayRole} account`;
      if (document.title) document.title = isStudent ? 'Student Registration | UENR Dues Portal' : `${displayRole.charAt(0).toUpperCase()}${displayRole.slice(1)} Registration | UENR Dues Portal`;

      if (campusField) campusField.style.display = 'block';
      if (schoolField) schoolField.style.display = 'block';
      if (departmentField) departmentField.style.display = 'block';
      if (studentIdField) studentIdField.style.display = isStudent ? 'block' : 'none';
      if (staffIdField) staffIdField.style.display = isStudent ? 'none' : 'block';
      if (programmeField) programmeField.style.display = isStudent ? 'block' : 'none';
      if (academicLevelField) academicLevelField.style.display = isStudent ? 'block' : 'none';
      if (academicYearField) academicYearField.style.display = isStudent ? 'block' : 'none';

      const studentIdInput = document.getElementById('studentId');
      const staffIdInput = document.getElementById('staffId');
      if (studentIdInput) studentIdInput.required = isStudent;
      if (staffIdInput) staffIdInput.required = !isStudent;
      if (!isStudent) {
        if (programmeSelect) programmeSelect.value = '';
        if (document.getElementById('academicLevel')) document.getElementById('academicLevel').value = '';
        if (document.getElementById('academicYear')) document.getElementById('academicYear').value = '';
      }
    }

    roleButtons.forEach((button) => {
      button.addEventListener('click', () => setRole(button.dataset.registerRole));
    });
    setRole(defaultRole);

    if (campusSelect) {
      campusSelect.innerHTML = '<option value="">Select campus</option>' + window.UENRAcademicStructure.map((campus) => `<option value="${campus.campus}">${campus.campus}</option>`).join('');

      const defaultCampus = window.UENRAcademicStructure[0] ? window.UENRAcademicStructure[0].campus : '';
      if (defaultCampus) {
        campusSelect.value = defaultCampus;
      }

      const applySchoolOptions = (campusName) => {
        const campusValue = campusName || defaultCampus || '';
        const schoolOptions = window.UENRHelpers.getSchoolOptions(campusValue);
        schoolSelect.innerHTML = '<option value="">Select school</option>' + schoolOptions.map((school) => `<option value="${school}">${school}</option>`).join('');
        schoolSelect.disabled = !campusValue || schoolOptions.length === 0;
        departmentSelect.innerHTML = '<option value="">Select department</option>';
        departmentSelect.disabled = true;
        programmeSelect.innerHTML = '<option value="">Select programme</option>';
        programmeSelect.disabled = true;

        if (schoolOptions.length === 1) {
          schoolSelect.value = schoolOptions[0];
          schoolSelect.dispatchEvent(new Event('change'));
        }
      };

      applySchoolOptions(campusSelect.value || defaultCampus);

      campusSelect.addEventListener('change', function () {
        const campusName = this.value;
        applySchoolOptions(campusName);
      });
    }

    if (schoolSelect) {
      schoolSelect.addEventListener('change', function () {
        const selectedCampus = campusSelect.value || (window.UENRAcademicStructure[0] ? window.UENRAcademicStructure[0].campus : '');
        const departments = window.UENRHelpers.getDepartmentOptions(selectedCampus, this.value);
        departmentSelect.innerHTML = '<option value="">Select department</option>' + departments.map((dept) => `<option value="${dept}">${dept}</option>`).join('');
        departmentSelect.disabled = !this.value || departments.length === 0;
        programmeSelect.innerHTML = '<option value="">Select programme</option>';
        programmeSelect.disabled = true;

        if (departments.length === 1) {
          departmentSelect.value = departments[0];
          departmentSelect.dispatchEvent(new Event('change'));
        }
      });
    }

    if (departmentSelect) {
      departmentSelect.addEventListener('change', function () {
        const programmes = window.UENRHelpers.getProgrammeOptions(campusSelect.value, schoolSelect.value, this.value);
        if (!programmes.length) {
          programmeSelect.innerHTML = '<option value="">No active programme available</option>';
          programmeSelect.disabled = true;
          return;
        }
        programmeSelect.innerHTML = '<option value="">Select programme</option>' + programmes.map((programme) => `<option value="${programme}">${programme}</option>`).join('');
        programmeSelect.disabled = false;

        if (programmes.length === 1) {
          programmeSelect.value = programmes[0];
        }
      });
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const roleButtonsSelected = document.querySelectorAll('[data-register-role]');
      const selectedRole = [...roleButtonsSelected].find((button) => button.classList.contains('active'))?.dataset.registerRole || 'student';
      const fullName = document.getElementById('fullName').value.trim();
      const studentId = document.getElementById('studentId').value.trim();
      const staffId = document.getElementById('staffId').value.trim();
      const email = document.getElementById('studentEmail').value.trim();
      const phone = document.getElementById('phoneNumber').value.trim();
      const campus = campusSelect.value;
      const school = schoolSelect.value;
      const department = departmentSelect.value;
      const programme = programmeSelect.value;
      const academicLevel = document.getElementById('academicLevel').value;
      const academicYear = document.getElementById('academicYear').value;
      const password = document.getElementById('registerPassword').value;
      const confirmPassword = document.getElementById('registerConfirmPassword').value;
      const accepted = document.getElementById('acceptTerms').checked;

      if (!fullName || !email || !phone || !campus || !school || !department) {
        toast('Please complete all required fields.', 'error');
        return;
      }

      if (selectedRole === 'student') {
        if (!studentId || !programme || !academicLevel || !academicYear) {
          toast('Please complete all student-specific fields.', 'error');
          return;
        }
      } else if (!staffId) {
        toast('Please enter a valid staff ID.', 'error');
        return;
      }

      if (!window.UENRValidation.emailIsValid(email)) {
        toast('Please provide a valid email address.', 'error');
        return;
      }
      if (!window.UENRValidation.passwordMeetsPolicy(password)) {
        toast('Password must contain 8+ characters, uppercase, number and symbol.', 'error');
        return;
      }
      if (password !== confirmPassword) {
        toast('Passwords do not match.', 'error');
        return;
      }
      if (!accepted) {
        toast('You must accept the terms and conditions.', 'error');
        return;
      }

      const users = window.UENRStorage.getUsers();
      const duplicate = users.some((user) => {
        const sameEmail = !!email && (user.email || '').toLowerCase() === email.toLowerCase();
        const sameStudentId = selectedRole === 'student' && !!studentId && (user.studentId || '').toLowerCase() === studentId.toLowerCase();
        const sameStaffId = selectedRole !== 'student' && !!staffId && (user.staffId || '').toLowerCase() === staffId.toLowerCase();
        return sameEmail || sameStudentId || sameStaffId;
      });
      if (duplicate) {
        toast('An account with that email or ID already exists.', 'error');
        return;
      }

      const newUser = {
        id: `${selectedRole}-` + Date.now(),
        role: selectedRole,
        fullName,
        email,
        phone,
        passwordHash: window.UENRStorage.hashValue(password),
        campus,
        school,
        department,
        studentId: selectedRole === 'student' ? studentId : '',
        staffId: selectedRole !== 'student' ? staffId : '',
        programme: selectedRole === 'student' ? programme : '',
        academicLevel: selectedRole === 'student' ? academicLevel : '',
        academicYear: selectedRole === 'student' ? academicYear : '',
        active: true,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      window.UENRStorage.saveUsers(users);
      window.UENRStorage.setCurrentUser(newUser);
      toast('Registration successful. Redirecting...');
      setTimeout(() => {
        const redirect = selectedRole === 'student' ? 'student-dashboard.html' : selectedRole === 'treasurer' ? 'treasurer-dashboard.html' : 'administrator-dashboard.html';
        window.location.href = redirect;
      }, 400);
    });
  }

  function handleForgotPassword() {
    const form = document.getElementById('forgotPasswordForm');
    if (!form) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = document.getElementById('resetEmail').value.trim();
      if (!email) {
        toast('Please enter your email address.', 'error');
        return;
      }
      toast('Demo reset instructions have been generated.', 'success');
    });
  }

  function protectPage() {
    const page = document.body.dataset.page;
    const currentUser = window.UENRStorage.getCurrentUser();
    const protectedPages = {
      'student-dashboard': ['student'],
      profile: ['student'],
      dues: ['student'],
      payment: ['student'],
      'payment-history': ['student'],
      receipt: ['student'],
      notifications: ['student'],
      complaints: ['student'],
      'treasurer-dashboard': ['treasurer'],
      'administrator-dashboard': ['admin'],
      departments: ['admin'],
      programmes: ['admin'],
      users: ['admin'],
      settings: ['admin'],
      'dues-management': ['admin', 'treasurer'],
      reports: ['admin', 'treasurer']
    };

    const allowedRoles = protectedPages[page];
    if (!allowedRoles) return;

    if (!currentUser) {
      window.location.href = 'login.html';
      return;
    }

    if (!allowedRoles.includes(currentUser.role)) {
      window.location.href = routeMap[currentUser.role] || 'login.html';
    }
  }

  function renderStudentDashboard() {
    const currentUser = window.UENRStorage.getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') return;

    const nameNode = document.querySelector('[data-user-name]');
    if (nameNode) nameNode.textContent = currentUser.fullName || 'Student';

    const summaryNode = document.querySelector('[data-profile-summary]');
    if (summaryNode) {
      summaryNode.innerHTML = `
        <div class="metric-card"><span class="label">Campus</span><strong class="value">${currentUser.campus}</strong></div>
        <div class="metric-card"><span class="label">School</span><strong class="value">${currentUser.school}</strong></div>
        <div class="metric-card"><span class="label">Department</span><strong class="value">${currentUser.department}</strong></div>
        <div class="metric-card"><span class="label">Programme</span><strong class="value">${currentUser.programme}</strong></div>
      `;
    }

    const dues = window.UENRStorage.getDues().filter((due) => due.programme === currentUser.programme && due.academicLevel === currentUser.academicLevel && due.academicYear === currentUser.academicYear);
    const payments = window.UENRStorage.getPayments().filter((payment) => payment.email === currentUser.email);
    const totalDue = dues.reduce((sum, due) => sum + Number(due.amount || 0), 0);
    const paid = payments.filter((payment) => payment.status === 'Successful').reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const metricsNode = document.querySelector('[data-student-metrics]');
    if (metricsNode) {
      metricsNode.innerHTML = `
        <div class="metric-card"><span class="label">Total dues</span><strong class="value">${new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 }).format(totalDue)}</strong></div>
        <div class="metric-card"><span class="label">Amount paid</span><strong class="value">${new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 }).format(paid)}</strong></div>
        <div class="metric-card"><span class="label">Outstanding</span><strong class="value">${new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 }).format(Math.max(totalDue - paid, 0))}</strong></div>
        <div class="metric-card"><span class="label">Status</span><strong class="value">${paid >= totalDue ? 'Cleared' : 'Pending'}</strong></div>
      `;
    }

    const rows = document.querySelector('[data-dashboard-transactions]');
    if (rows) {
      rows.innerHTML = payments.length ? payments.slice(0, 4).map((payment) => `
        <tr>
          <td>${payment.duesTitle}</td>
          <td>${new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 0 }).format(payment.amount)}</td>
          <td><span class="badge ${payment.status === 'Successful' ? 'success' : payment.status === 'Pending' ? 'pending' : 'failed'}">${payment.status}</span></td>
          <td>${payment.paymentDate || 'N/A'}</td>
        </tr>
      `).join('') : '<tr><td colspan="4"><div class="empty-state">No payment activity yet.</div></td></tr>';
    }

    const notifNode = document.querySelector('[data-notifications-list]');
    if (notifNode) {
      const notes = window.UENRStorage.getNotifications()
        .filter((note) => note.userId === currentUser.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);
      notifNode.innerHTML = notes.length ? notes.map((note) => `
        <div class="notification-item ${note.isRead ? '' : 'unread'}">
          <strong>${esc(note.title)}</strong>
          <p class="muted">${esc(note.message)}</p>
        </div>
      `).join('') : '<div class="empty-state">No notifications yet.</div>';
    }
  }

  function renderTreasurerDashboard() {
    const currentUser = window.UENRStorage.getCurrentUser();
    if (!currentUser || currentUser.role !== 'treasurer') return;
    const payments = window.UENRStorage.getPayments();
    const summaryNode = document.querySelector('[data-treasurer-summary]');
    if (summaryNode) {
      summaryNode.innerHTML = `
        <div class="metric-card"><span class="label">Pending</span><strong class="value">${payments.filter((item) => item.status === 'Pending').length}</strong></div>
        <div class="metric-card"><span class="label">Successful</span><strong class="value">${payments.filter((item) => item.status === 'Successful').length}</strong></div>
        <div class="metric-card"><span class="label">Rejected</span><strong class="value">${payments.filter((item) => item.status === 'Rejected').length}</strong></div>
        <div class="metric-card"><span class="label">Total</span><strong class="value">${payments.length}</strong></div>
      `;
    }

    const pendingNode = document.querySelector('[data-treasurer-pending]');
    if (pendingNode) {
      const pending = payments.filter((item) => item.status === 'Pending').slice(0, 5);
      pendingNode.innerHTML = pending.length ? pending.map((payment) => `
        <div class="notification-item">
          <div class="status-row">
            <strong>${esc(payment.studentName)}</strong>
            <span class="badge pending">Pending</span>
          </div>
          <p class="muted">${esc(payment.duesTitle)} • ${formatCurrency(payment.amount)} • Ref: ${esc(payment.transactionReference)}</p>
        </div>
      `).join('') : '<div class="empty-state">No payments awaiting verification.</div>';
    }
  }

  function renderAdminDashboard() {
    const currentUser = window.UENRStorage.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') return;
    const summaryNode = document.querySelector('[data-admin-summary]');
    if (summaryNode) {
      const users = window.UENRStorage.getUsers();
      const payments = window.UENRStorage.getPayments();
      summaryNode.innerHTML = `
        <div class="metric-card"><span class="label">Students</span><strong class="value">${users.filter((user) => user.role === 'student').length}</strong></div>
        <div class="metric-card"><span class="label">Treasurers</span><strong class="value">${users.filter((user) => user.role === 'treasurer').length}</strong></div>
        <div class="metric-card"><span class="label">Payments</span><strong class="value">${payments.length}</strong></div>
        <div class="metric-card"><span class="label">Pending verification</span><strong class="value">${payments.filter((item) => item.status === 'Pending').length}</strong></div>
      `;
    }
  }

  function initLogout() {
    document.querySelectorAll('[data-logout]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        window.UENRStorage.logoutUser();
      });
    });
  }

  function renderNotificationBadge(currentUser) {
    const link = document.querySelector('[data-notifications-link]');
    if (!link || !currentUser) return;
    const unread = window.UENRStorage.getNotifications().filter((note) => note.userId === currentUser.id && !note.isRead).length;
    link.dataset.count = String(unread);
  }

  function computeStudentDueStatus(due, payments) {
    const related = payments.filter((payment) => payment.duesId === due.id);
    if (related.some((payment) => payment.status === 'Successful')) return 'Paid';
    if (related.some((payment) => payment.status === 'Pending')) return 'Pending';
    return 'Unpaid';
  }

  function getStudentDues(currentUser) {
    return window.UENRStorage.getDues().filter((due) =>
      due.status === 'active' &&
      due.programme === currentUser.programme &&
      due.academicLevel === currentUser.academicLevel &&
      due.academicYear === currentUser.academicYear
    );
  }

  function renderDuesPage() {
    const currentUser = window.UENRStorage.getCurrentUser();
    if (!currentUser) return;
    const container = document.getElementById('duesList');
    if (!container) return;

    const dues = getStudentDues(currentUser);
    const payments = window.UENRStorage.getPayments().filter((payment) => payment.email === currentUser.email);

    if (!dues.length) {
      container.innerHTML = '<div class="empty-state">No dues have been assigned to your programme and level yet.</div>';
      return;
    }

    container.innerHTML = dues.map((due) => {
      const status = computeStudentDueStatus(due, payments);
      const badgeClass = status === 'Paid' ? 'success' : status === 'Pending' ? 'pending' : 'failed';
      return `
        <div class="card">
          <span class="badge ${badgeClass}">${status}</span>
          <h3>${esc(due.title)}</h3>
          <p class="muted">${esc(due.description || '')}</p>
          <p><strong>${formatCurrency(due.amount)}</strong></p>
          <p class="muted">Category: ${esc(due.category || 'General')}</p>
          <p class="muted">Due date: ${formatDate(due.dueDate)}</p>
        </div>`;
    }).join('');
  }

  function renderPaymentPage() {
    const currentUser = window.UENRStorage.getCurrentUser();
    if (!currentUser) return;
    const list = document.getElementById('duesPaymentList');
    const form = document.getElementById('paymentForm');
    if (!list || !form) return;

    const dues = getStudentDues(currentUser);
    const payments = window.UENRStorage.getPayments().filter((payment) => payment.email === currentUser.email);
    const payable = dues.filter((due) => computeStudentDueStatus(due, payments) === 'Unpaid');
    const submitButton = form.querySelector('button[type="submit"]');

    if (!payable.length) {
      list.innerHTML = '<div class="empty-state">You have no outstanding dues to pay right now.</div>';
      if (submitButton) submitButton.disabled = true;
      return;
    }

    list.innerHTML = payable.map((due) => `
      <label class="dues-option">
        <input type="checkbox" name="duesSelection" value="${due.id}" />
        <span>
          <em>${esc(due.title)}</em>
          <small>${esc(due.category || 'General')} • Due ${formatDate(due.dueDate)}</small>
        </span>
        <strong>${formatCurrency(due.amount)}</strong>
      </label>
    `).join('');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const checked = Array.from(list.querySelectorAll('input[name="duesSelection"]:checked'));
      if (!checked.length) {
        toast('Please select at least one due to pay.', 'error');
        return;
      }

      const method = document.getElementById('paymentMethod').value;
      const allPayments = window.UENRStorage.getPayments();
      const notifications = window.UENRStorage.getNotifications();

      checked.forEach((box) => {
        const due = payable.find((item) => item.id === box.value);
        if (!due) return;
        const reference = genReference();
        allPayments.push({
          id: genId('pay'),
          studentId: currentUser.studentId || '',
          studentName: currentUser.fullName,
          email: currentUser.email,
          amount: due.amount,
          currency: due.currency || 'GHS',
          duesId: due.id,
          duesTitle: due.title,
          paymentMethod: method,
          transactionReference: reference,
          paymentDate: new Date().toISOString().slice(0, 10),
          status: 'Pending',
          verifiedBy: '',
          verificationDate: '',
          campus: currentUser.campus,
          school: currentUser.school,
          department: currentUser.department,
          programme: currentUser.programme,
          academicLevel: currentUser.academicLevel
        });
        notifications.unshift({
          id: genId('note'),
          userId: currentUser.id,
          title: 'Payment submitted for verification',
          message: `Your payment of ${formatCurrency(due.amount)} for ${due.title} has been submitted and is awaiting review.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          type: 'payment'
        });
      });

      window.UENRStorage.savePayments(allPayments);
      window.UENRStorage.saveNotifications(notifications);
      window.UENRStorage.appendAuditLog({ actor: currentUser.email, action: `Submitted ${checked.length} demo payment(s) for verification` });
      toast('Demo payment captured and sent for verification.');
      setTimeout(() => { window.location.href = 'payment-history.html'; }, 700);
    });
  }

  function buildReceiptHTML(payment) {
    return `
      <div class="receipt-box">
        <div class="receipt-header">
          <div>
            <span class="eyebrow">Official demo receipt</span>
            <h2>${esc(payment.duesTitle)}</h2>
          </div>
          <span class="badge success">Verified</span>
        </div>
        <div class="receipt-grid">
          <p><strong>Reference</strong><br>${esc(payment.transactionReference)}</p>
          <p><strong>Student</strong><br>${esc(payment.studentName)}</p>
          <p><strong>Student ID</strong><br>${esc(payment.studentId || 'N/A')}</p>
          <p><strong>Amount</strong><br>${formatCurrency(payment.amount)}</p>
          <p><strong>Method</strong><br>${esc(payment.paymentMethod)}</p>
          <p><strong>Payment date</strong><br>${formatDate(payment.paymentDate)}</p>
          <p><strong>Verified by</strong><br>${esc(payment.verifiedBy || 'N/A')}</p>
          <p><strong>Verification date</strong><br>${formatDate(payment.verificationDate)}</p>
        </div>
        <p class="muted" style="margin-top: 18px;">This is a demo receipt generated for prototype purposes only. It is not a legally binding financial document.</p>
      </div>`;
  }

  function renderReceiptPage() {
    const currentUser = window.UENRStorage.getCurrentUser();
    if (!currentUser) return;
    const container = document.getElementById('receiptContainer');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const successful = window.UENRStorage.getPayments()
      .filter((payment) => payment.email === currentUser.email && payment.status === 'Successful')
      .sort((a, b) => new Date(b.verificationDate || b.paymentDate) - new Date(a.verificationDate || a.paymentDate));

    const payment = (ref && successful.find((item) => item.transactionReference === ref)) || successful[0];

    if (!payment) {
      container.innerHTML = '<div class="empty-state">No verified payments yet. Receipts appear here once a payment is verified.</div>';
      return;
    }

    container.innerHTML = buildReceiptHTML(payment);
  }

  function renderPaymentHistoryPage() {
    const currentUser = window.UENRStorage.getCurrentUser();
    if (!currentUser) return;
    const tbody = document.getElementById('paymentHistoryTable');
    if (!tbody) return;

    const payments = window.UENRStorage.getPayments()
      .filter((payment) => payment.email === currentUser.email)
      .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    if (!payments.length) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state">No payment records yet.</div></td></tr>';
      return;
    }

    tbody.innerHTML = payments.map((payment) => `
      <tr>
        <td>${esc(payment.transactionReference)}</td>
        <td>${esc(payment.duesTitle)}</td>
        <td>${formatCurrency(payment.amount)}</td>
        <td><span class="badge ${payment.status === 'Successful' ? 'success' : payment.status === 'Pending' ? 'pending' : 'failed'}">${payment.status}</span></td>
        <td>${esc(payment.paymentMethod)}</td>
        <td>${formatDate(payment.paymentDate)}</td>
        <td>${payment.status === 'Successful' ? `<a class="link-plain" href="receipt.html?ref=${encodeURIComponent(payment.transactionReference)}">View</a>` : '—'}</td>
      </tr>
    `).join('');
  }

  function renderNotificationsPage() {
    const currentUser = window.UENRStorage.getCurrentUser();
    if (!currentUser) return;
    const container = document.getElementById('notificationList');
    if (!container) return;

    function paint() {
      const notes = window.UENRStorage.getNotifications()
        .filter((note) => note.userId === currentUser.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (!notes.length) {
        container.innerHTML = '<div class="empty-state">You have no notifications yet.</div>';
        return;
      }

      container.innerHTML = notes.map((note) => `
        <div class="notification-item ${note.isRead ? '' : 'unread'}" data-note-id="${note.id}">
          <div class="status-row">
            <strong>${esc(note.title)}</strong>
            ${note.isRead ? '' : '<button type="button" class="link-plain" data-mark-read>Mark as read</button>'}
          </div>
          <p class="muted">${esc(note.message)}</p>
          <small class="muted">${formatDate(note.createdAt)}</small>
        </div>
      `).join('');

      container.querySelectorAll('[data-mark-read]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.closest('[data-note-id]').dataset.noteId;
          const all = window.UENRStorage.getNotifications();
          const target = all.find((note) => note.id === id);
          if (target) target.isRead = true;
          window.UENRStorage.saveNotifications(all);
          paint();
          renderNotificationBadge(currentUser);
        });
      });
    }

    paint();
  }

  function renderComplaintsPage() {
    const currentUser = window.UENRStorage.getCurrentUser();
    if (!currentUser) return;
    const form = document.getElementById('complaintForm');
    const history = document.getElementById('complaintHistory');

    function paintHistory() {
      if (!history) return;
      const mine = window.UENRStorage.getComplaints()
        .filter((complaint) => complaint.email === currentUser.email)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      if (!mine.length) {
        history.innerHTML = '<div class="empty-state">No complaints submitted yet.</div>';
        return;
      }

      history.innerHTML = mine.map((complaint) => `
        <div class="notification-item">
          <div class="status-row">
            <strong>${esc(complaint.subject)}</strong>
            <span class="badge ${complaint.status === 'Resolved' ? 'success' : complaint.status === 'In Review' ? 'pending' : 'info'}">${complaint.status}</span>
          </div>
          <p class="muted">${esc(complaint.description)}</p>
          <small class="muted">Ref: ${esc(complaint.paymentReference)} • ${formatDate(complaint.createdAt)}</small>
        </div>
      `).join('');
    }

    paintHistory();

    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const subject = document.getElementById('subject').value.trim();
        const paymentReference = document.getElementById('paymentReference').value.trim();
        const description = document.getElementById('description').value.trim();

        if (!subject || !paymentReference || !description) {
          toast('Please complete all complaint fields.', 'error');
          return;
        }

        const complaints = window.UENRStorage.getComplaints();
        complaints.unshift({
          id: genId('cmp'),
          studentName: currentUser.fullName,
          email: currentUser.email,
          subject,
          paymentReference,
          description,
          status: 'Submitted',
          createdAt: new Date().toISOString()
        });
        window.UENRStorage.saveComplaints(complaints);
        window.UENRStorage.appendAuditLog({ actor: currentUser.email, action: `Submitted complaint: ${subject}` });
        toast('Complaint submitted. The treasury team will review it.');
        form.reset();
        paintHistory();
      });
    }
  }

  function renderProfilePage() {
    const currentUser = window.UENRStorage.getCurrentUser();
    if (!currentUser) return;
    const container = document.querySelector('[data-profile-summary]');
    if (!container) return;

    function paint() {
      const isStudent = currentUser.role === 'student';
      container.innerHTML = `
        <div class="summary-layout">
          <div>
            <h3>${esc(currentUser.fullName)}</h3>
            <p class="muted">${esc(currentUser.email)}</p>
            <p class="muted">${esc(currentUser.phone || 'No phone on file')}</p>
            <p class="muted">${isStudent ? 'Student ID: ' + esc(currentUser.studentId || 'N/A') : 'Staff ID: ' + esc(currentUser.staffId || 'N/A')}</p>
          </div>
          <div class="metric-grid" style="grid-template-columns: repeat(2, minmax(0, 1fr)); margin-bottom: 0;">
            <div class="metric-card"><span class="label">Campus</span><strong class="value" style="font-size: 1rem;">${esc(currentUser.campus || 'N/A')}</strong></div>
            <div class="metric-card"><span class="label">School</span><strong class="value" style="font-size: 1rem;">${esc(currentUser.school || 'N/A')}</strong></div>
            <div class="metric-card"><span class="label">Department</span><strong class="value" style="font-size: 1rem;">${esc(currentUser.department || 'N/A')}</strong></div>
            ${isStudent ? `<div class="metric-card"><span class="label">Programme</span><strong class="value" style="font-size: 1rem;">${esc(currentUser.programme || 'N/A')}</strong></div>` : ''}
          </div>
        </div>
        <form id="profileEditForm" class="form-grid" style="margin-top: 24px;">
          <div class="field">
            <label for="profilePhone">Phone number</label>
            <input id="profilePhone" type="text" value="${esc(currentUser.phone || '')}" />
          </div>
          <div class="field">
            <label for="profileNewPassword">New password (optional)</label>
            <input id="profileNewPassword" type="password" placeholder="Leave blank to keep current password" />
          </div>
          <button type="submit" class="btn btn-primary">Save changes</button>
        </form>
      `;

      document.getElementById('profileEditForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const phone = document.getElementById('profilePhone').value.trim();
        const newPassword = document.getElementById('profileNewPassword').value;

        if (newPassword && !window.UENRValidation.passwordMeetsPolicy(newPassword)) {
          toast('New password must contain 8+ characters, uppercase, number and symbol.', 'error');
          return;
        }

        const users = window.UENRStorage.getUsers();
        const target = users.find((user) => user.id === currentUser.id);
        if (target) {
          target.phone = phone;
          if (newPassword) target.passwordHash = window.UENRStorage.hashValue(newPassword);
          window.UENRStorage.saveUsers(users);
          window.UENRStorage.setCurrentUser(target);
          window.UENRStorage.appendAuditLog({ actor: currentUser.email, action: 'Updated profile details' });
          toast('Profile updated successfully.');
        }
      });
    }

    paint();
  }

  function renderSettingsPage() {
    const currentUser = window.UENRStorage.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') return;
    const container = document.getElementById('settingsSummary');
    if (!container) return;

    function paint() {
      const settings = window.UENRStorage.getSettings();
      const logs = window.UENRStorage.getStorage(window.UENRStorage.STORAGE_KEYS.auditLogs, []);
      container.innerHTML = `
        <form id="settingsForm" class="form-grid">
          <div class="field">
            <label for="appName">Application name</label>
            <input id="appName" type="text" value="${esc(settings.appName)}" />
          </div>
          <div class="field">
            <label for="sessionTimeout">Session timeout (minutes)</label>
            <input id="sessionTimeout" type="number" min="5" max="120" value="${settings.sessionTimeoutMinutes}" />
          </div>
          <div class="field full-width">
            <label class="check-inline"><input type="checkbox" id="darkModeToggle" ${settings.darkMode ? 'checked' : ''} /> <span>Enable dark mode preference (demo flag only)</span></label>
          </div>
          <div class="field full-width">
            <label class="check-inline"><input type="checkbox" id="demoModeToggle" ${settings.demoMode ? 'checked' : ''} disabled /> <span>Demo mode is always on in this prototype</span></label>
          </div>
          <button type="submit" class="btn btn-primary">Save settings</button>
        </form>
        <div class="table-card" style="margin-top: 24px;">
          <h3>Recent audit log</h3>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Actor</th><th>Action</th><th>Timestamp</th></tr></thead>
              <tbody>${logs.slice(0, 10).map((log) => `<tr><td>${esc(log.actor)}</td><td>${esc(log.action)}</td><td>${formatDate(log.timestamp)}</td></tr>`).join('') || '<tr><td colspan="3"><div class="empty-state">No activity recorded yet.</div></td></tr>'}</tbody>
            </table>
          </div>
        </div>
      `;

      document.getElementById('settingsForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const updated = {
          ...settings,
          appName: document.getElementById('appName').value.trim() || settings.appName,
          sessionTimeoutMinutes: Number(document.getElementById('sessionTimeout').value) || settings.sessionTimeoutMinutes,
          darkMode: document.getElementById('darkModeToggle').checked
        };
        window.UENRStorage.saveSettings(updated);
        window.UENRStorage.appendAuditLog({ actor: currentUser.email, action: 'Updated system settings' });
        toast('Settings saved.');
        paint();
      });
    }

    paint();
  }

  function renderDepartmentsPage() {
    const currentUser = window.UENRStorage.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') return;
    const container = document.getElementById('departmentsList');
    if (!container) return;

    const users = window.UENRStorage.getUsers();
    const dues = window.UENRStorage.getDues();
    const payments = window.UENRStorage.getPayments();

    const deptMap = new Map();
    window.UENRAcademicStructure.forEach((campus) => {
      campus.schools.forEach((school) => {
        school.departments.forEach((dept) => {
          if (!deptMap.has(dept.name)) {
            deptMap.set(dept.name, {
              name: dept.name,
              school: school.name,
              campus: campus.campus,
              programmes: dept.programmes.filter((programme) => programme.active).length
            });
          }
        });
      });
    });

    container.innerHTML = Array.from(deptMap.values()).map((dept) => {
      const studentCount = users.filter((user) => user.role === 'student' && user.department === dept.name).length;
      const duesCount = dues.filter((due) => due.department === dept.name && due.status === 'active').length;
      const collected = payments.filter((payment) => payment.department === dept.name && payment.status === 'Successful').reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      return `
        <div class="notification-item">
          <div class="status-row">
            <strong>${esc(dept.name)}</strong>
            <span class="inline-tag">${dept.programmes} programme${dept.programmes === 1 ? '' : 's'}</span>
          </div>
          <p class="muted">${esc(dept.school)} • ${esc(dept.campus)}</p>
          <p class="muted">${studentCount} student(s) registered • ${duesCount} active due(s) • ${formatCurrency(collected)} collected</p>
        </div>`;
    }).join('') || '<div class="empty-state">No departments configured.</div>';
  }

  function renderProgrammesPage() {
    const currentUser = window.UENRStorage.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') return;
    const container = document.getElementById('programmesList');
    if (!container) return;

    const users = window.UENRStorage.getUsers();
    const flat = window.UENRHelpers.flattenAcademicStructure();

    container.innerHTML = flat.map((item) => {
      const studentCount = users.filter((user) => user.role === 'student' && user.programme === item.programme).length;
      return `
        <div class="notification-item">
          <div class="status-row">
            <strong>${esc(item.programme)}</strong>
            <span class="badge info">${esc(item.type)}</span>
          </div>
          <p class="muted">${esc(item.department)} • ${esc(item.school)}</p>
          <p class="muted">${studentCount} student(s) enrolled</p>
        </div>`;
    }).join('') || '<div class="empty-state">No programmes configured.</div>';
  }

  function renderUsersPage() {
    const currentUser = window.UENRStorage.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') return;
    const container = document.getElementById('usersList');
    if (!container) return;

    function paint() {
      const users = window.UENRStorage.getUsers().slice().sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
      container.innerHTML = users.map((user) => `
        <div class="notification-item" data-user-row="${user.id}">
          <div class="status-row">
            <strong>${esc(user.fullName)}</strong>
            <span class="badge ${user.role === 'admin' ? 'info' : user.role === 'treasurer' ? 'pending' : 'success'}">${user.role}</span>
          </div>
          <p class="muted">${esc(user.email)} • ${esc(user.department || 'N/A')}</p>
          <div class="status-row">
            <span class="badge ${user.active ? 'success' : 'failed'}">${user.active ? 'Active' : 'Suspended'}</span>
            <span>
              <button type="button" class="link-plain" data-toggle-active>${user.active ? 'Suspend' : 'Activate'}</button>
              ${user.id.includes('demo') ? '' : ' <button type="button" class="link-plain" data-delete-user>Delete</button>'}
            </span>
          </div>
        </div>
      `).join('') || '<div class="empty-state">No users found.</div>';

      container.querySelectorAll('[data-toggle-active]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.closest('[data-user-row]').dataset.userRow;
          const users2 = window.UENRStorage.getUsers();
          const target = users2.find((user) => user.id === id);
          if (target) {
            target.active = !target.active;
            window.UENRStorage.saveUsers(users2);
            window.UENRStorage.appendAuditLog({ actor: currentUser.email, action: `${target.active ? 'Activated' : 'Suspended'} account for ${target.email}` });
            toast(`${target.fullName} is now ${target.active ? 'active' : 'suspended'}.`);
            paint();
          }
        });
      });

      container.querySelectorAll('[data-delete-user]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.closest('[data-user-row]').dataset.userRow;
          let users2 = window.UENRStorage.getUsers();
          const target = users2.find((user) => user.id === id);
          if (!target) return;
          if (!window.confirm(`Remove ${target.fullName}'s account? This cannot be undone.`)) return;
          users2 = users2.filter((user) => user.id !== id);
          window.UENRStorage.saveUsers(users2);
          window.UENRStorage.appendAuditLog({ actor: currentUser.email, action: `Deleted account for ${target.email}` });
          toast('Account removed.');
          paint();
        });
      });
    }

    paint();
  }

  function renderDuesManagementPage() {
    const currentUser = window.UENRStorage.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'treasurer')) return;

    const form = document.getElementById('dueForm');
    const list = document.getElementById('adminDuesList');
    const pendingList = document.getElementById('pendingPaymentsList');

    if (form) {
      if (currentUser.role !== 'admin') {
        form.closest('[data-admin-only]').style.display = 'none';
      } else {
        const campusSelect = document.getElementById('dueCampus');
        const schoolSelect = document.getElementById('dueSchool');
        const departmentSelect = document.getElementById('dueDepartment');
        const programmeSelect = document.getElementById('dueProgramme');
        const categorySelect = document.getElementById('dueCategory');
        const levelSelect = document.getElementById('dueLevel');
        const yearSelect = document.getElementById('dueYear');

        campusSelect.innerHTML = window.UENRAcademicStructure.map((campus) => `<option value="${campus.campus}">${campus.campus}</option>`).join('');
        categorySelect.innerHTML = window.UENR_DUES_CATEGORIES.map((category) => `<option value="${category}">${category}</option>`).join('');
        levelSelect.innerHTML = window.UENRAcademicLevels.map((level) => `<option value="${level}">${level}</option>`).join('');
        yearSelect.innerHTML = window.UENRAcademicYears.map((year) => `<option value="${year}">${year}</option>`).join('');

        function refreshSchools() {
          const schools = window.UENRHelpers.getSchoolOptions(campusSelect.value);
          schoolSelect.innerHTML = schools.map((school) => `<option value="${school}">${school}</option>`).join('');
          refreshDepartments();
        }
        function refreshDepartments() {
          const departments = window.UENRHelpers.getDepartmentOptions(campusSelect.value, schoolSelect.value);
          departmentSelect.innerHTML = departments.map((department) => `<option value="${department}">${department}</option>`).join('');
          refreshProgrammes();
        }
        function refreshProgrammes() {
          const programmes = window.UENRHelpers.getProgrammeOptions(campusSelect.value, schoolSelect.value, departmentSelect.value);
          programmeSelect.innerHTML = programmes.map((programme) => `<option value="${programme}">${programme}</option>`).join('');
        }

        campusSelect.addEventListener('change', refreshSchools);
        schoolSelect.addEventListener('change', refreshDepartments);
        departmentSelect.addEventListener('change', refreshProgrammes);
        refreshSchools();

        form.addEventListener('submit', (event) => {
          event.preventDefault();
          const title = document.getElementById('dueTitle').value.trim();
          const description = document.getElementById('dueDescription').value.trim();
          const amount = Number(document.getElementById('dueAmount').value);
          const dueDate = document.getElementById('dueDate').value;

          if (!title || !amount || amount <= 0) {
            toast('Please provide a valid title and amount.', 'error');
            return;
          }

          const dues = window.UENRStorage.getDues();
          dues.push({
            id: genId('dues'),
            title,
            description,
            amount,
            currency: 'GHS',
            campus: campusSelect.value,
            school: schoolSelect.value,
            department: departmentSelect.value,
            programme: programmeSelect.value,
            academicLevel: levelSelect.value,
            academicYear: yearSelect.value,
            category: categorySelect.value,
            status: 'active',
            dueDate: dueDate || '',
            createdAt: new Date().toISOString().slice(0, 10),
            createdBy: currentUser.email
          });
          window.UENRStorage.saveDues(dues);
          window.UENRStorage.appendAuditLog({ actor: currentUser.email, action: `Created due: ${title}` });
          toast('New due created.');
          form.reset();
          refreshSchools();
          paintDues();
        });
      }
    }

    function paintDues() {
      if (!list) return;
      const dues = window.UENRStorage.getDues().slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const canManage = currentUser.role === 'admin';

      list.innerHTML = dues.map((due) => `
        <div class="notification-item" data-due-row="${due.id}">
          <div class="status-row">
            <strong>${esc(due.title)}</strong>
            <span class="badge ${due.status === 'active' ? 'success' : 'failed'}">${due.status}</span>
          </div>
          <p class="muted">${esc(due.department)} • ${esc(due.programme)} • Level ${esc(due.academicLevel)} • ${esc(due.academicYear)}</p>
          <p><strong>${formatCurrency(due.amount)}</strong> <span class="muted">Due ${formatDate(due.dueDate)}</span></p>
          ${canManage ? `
          <div class="status-row">
            <button type="button" class="link-plain" data-toggle-due>${due.status === 'active' ? 'Deactivate' : 'Activate'}</button>
            <button type="button" class="link-plain" data-delete-due>Delete</button>
          </div>` : ''}
        </div>
      `).join('') || '<div class="empty-state">No dues have been created yet.</div>';

      if (canManage) {
        list.querySelectorAll('[data-toggle-due]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.closest('[data-due-row]').dataset.dueRow;
            const dues2 = window.UENRStorage.getDues();
            const target = dues2.find((due) => due.id === id);
            if (target) {
              target.status = target.status === 'active' ? 'inactive' : 'active';
              window.UENRStorage.saveDues(dues2);
              window.UENRStorage.appendAuditLog({ actor: currentUser.email, action: `${target.status === 'active' ? 'Activated' : 'Deactivated'} due: ${target.title}` });
              paintDues();
            }
          });
        });

        list.querySelectorAll('[data-delete-due]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const id = btn.closest('[data-due-row]').dataset.dueRow;
            let dues2 = window.UENRStorage.getDues();
            const target = dues2.find((due) => due.id === id);
            if (!target) return;
            if (!window.confirm(`Delete "${target.title}"? This cannot be undone.`)) return;
            dues2 = dues2.filter((due) => due.id !== id);
            window.UENRStorage.saveDues(dues2);
            window.UENRStorage.appendAuditLog({ actor: currentUser.email, action: `Deleted due: ${target.title}` });
            toast('Due removed.');
            paintDues();
          });
        });
      }
    }

    function paintPending() {
      if (!pendingList) return;
      const pending = window.UENRStorage.getPayments().filter((payment) => payment.status === 'Pending').sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

      pendingList.innerHTML = pending.map((payment) => `
        <div class="notification-item" data-payment-row="${payment.id}">
          <div class="status-row">
            <strong>${esc(payment.studentName)}</strong>
            <span class="badge pending">Pending</span>
          </div>
          <p class="muted">${esc(payment.duesTitle)} • ${formatCurrency(payment.amount)} • ${esc(payment.paymentMethod)}</p>
          <p class="muted">Ref: ${esc(payment.transactionReference)} • Submitted ${formatDate(payment.paymentDate)}</p>
          <div class="status-row">
            <button type="button" class="btn btn-primary" data-approve-payment>Approve</button>
            <button type="button" class="link-plain" data-reject-payment>Reject</button>
          </div>
        </div>
      `).join('') || '<div class="empty-state">No payments awaiting verification.</div>';

      pendingList.querySelectorAll('[data-approve-payment]').forEach((btn) => {
        btn.addEventListener('click', () => processVerification(btn, 'Successful'));
      });
      pendingList.querySelectorAll('[data-reject-payment]').forEach((btn) => {
        btn.addEventListener('click', () => processVerification(btn, 'Rejected'));
      });
    }

    function processVerification(btn, status) {
      const id = btn.closest('[data-payment-row]').dataset.paymentRow;
      const payments = window.UENRStorage.getPayments();
      const target = payments.find((payment) => payment.id === id);
      if (!target) return;

      target.status = status;
      target.verifiedBy = currentUser.email;
      target.verificationDate = new Date().toISOString().slice(0, 10);
      window.UENRStorage.savePayments(payments);

      const notifications = window.UENRStorage.getNotifications();
      const owner = window.UENRStorage.getUsers().find((user) => user.email === target.email);
      notifications.unshift({
        id: genId('note'),
        userId: owner ? owner.id : '',
        title: status === 'Successful' ? 'Payment verified' : 'Payment rejected',
        message: status === 'Successful'
          ? `Your payment of ${formatCurrency(target.amount)} for ${target.duesTitle} has been verified. Your receipt is now available.`
          : `Your payment of ${formatCurrency(target.amount)} for ${target.duesTitle} was rejected. Please contact the treasury office.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        type: status === 'Successful' ? 'receipt' : 'payment'
      });
      window.UENRStorage.saveNotifications(notifications);
      window.UENRStorage.appendAuditLog({ actor: currentUser.email, action: `${status === 'Successful' ? 'Approved' : 'Rejected'} payment ${target.transactionReference}` });
      toast(`Payment ${status === 'Successful' ? 'approved' : 'rejected'}.`);
      paintPending();
    }

    paintDues();
    paintPending();
  }

  function renderReportsPage() {
    const currentUser = window.UENRStorage.getCurrentUser();
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'treasurer')) return;
    const tbody = document.getElementById('reportsTable');
    if (!tbody) return;

    const dues = window.UENRStorage.getDues();
    const users = window.UENRStorage.getUsers();
    const payments = window.UENRStorage.getPayments();

    const rows = dues.map((due) => {
      const students = users.filter((user) => user.role === 'student' && user.programme === due.programme && user.academicLevel === due.academicLevel && user.academicYear === due.academicYear);
      const relatedPayments = payments.filter((payment) => payment.duesId === due.id && payment.status === 'Successful');
      const paidCount = new Set(relatedPayments.map((payment) => payment.email)).size;
      const unpaidCount = Math.max(students.length - paidCount, 0);
      const expected = due.amount * students.length;
      const collected = relatedPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      return { due, studentsCount: students.length, paidCount, unpaidCount, expected, collected };
    });

    tbody.innerHTML = rows.map((row) => `
      <tr>
        <td>${esc(row.due.department)}</td>
        <td>${esc(row.due.programme)}</td>
        <td>${esc(row.due.academicLevel)}</td>
        <td>${row.studentsCount}</td>
        <td>${row.paidCount}</td>
        <td>${row.unpaidCount}</td>
        <td>${formatCurrency(row.expected)}</td>
        <td>${formatCurrency(row.collected)}</td>
        <td>${formatCurrency(Math.max(row.expected - row.collected, 0))}</td>
      </tr>
    `).join('') || '<tr><td colspan="9"><div class="empty-state">No dues configured for reporting yet.</div></td></tr>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!window.UENRStorage) return;
    window.UENRStorage.ensureDemoData();
    bindRoleTabs();
    bindPasswordToggles();
    handleLogin();
    handleRegister();
    handleForgotPassword();
    const createAccountLink = document.getElementById('createAccountLink');
    const createAccountPrompt = document.getElementById('createAccountPrompt');
    if (createAccountLink && createAccountPrompt) {
      const syncCreateAccountLink = () => {
        const selectedRole = document.getElementById('loginRole')?.value || 'student';
        const labelMap = {
          student: 'student',
          treasurer: 'treasurer',
          admin: 'administrator'
        };
        const title = labelMap[selectedRole] || 'student';
        createAccountLink.href = `register.html?role=${selectedRole}`;
        createAccountLink.textContent = `Create ${title} account`;
        createAccountPrompt.textContent = `New ${title}?`;
      };
      syncCreateAccountLink();
      document.querySelectorAll('[data-role-button]').forEach((button) => {
        button.addEventListener('click', syncCreateAccountLink);
      });
    }
    protectPage();
    initLogout();

    const currentUser = window.UENRStorage.getCurrentUser();
    if (currentUser) renderNotificationBadge(currentUser);

    const page = document.body.dataset.page;
    if (page === 'student-dashboard') renderStudentDashboard();
    if (page === 'treasurer-dashboard') renderTreasurerDashboard();
    if (page === 'administrator-dashboard') renderAdminDashboard();
    if (page === 'dues') renderDuesPage();
    if (page === 'payment') renderPaymentPage();
    if (page === 'receipt') renderReceiptPage();
    if (page === 'payment-history') renderPaymentHistoryPage();
    if (page === 'notifications') renderNotificationsPage();
    if (page === 'complaints') renderComplaintsPage();
    if (page === 'profile') renderProfilePage();
    if (page === 'settings') renderSettingsPage();
    if (page === 'departments') renderDepartmentsPage();
    if (page === 'programmes') renderProgrammesPage();
    if (page === 'users') renderUsersPage();
    if (page === 'dues-management') renderDuesManagementPage();
    if (page === 'reports') renderReportsPage();
  });
})();
