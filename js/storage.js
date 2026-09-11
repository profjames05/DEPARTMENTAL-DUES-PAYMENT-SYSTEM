(function () {
  const STORAGE_KEYS = {
    users: 'uenr_demo_users',
    currentUser: 'uenr_demo_current_user',
    dues: 'uenr_demo_dues',
    payments: 'uenr_demo_payments',
    notifications: 'uenr_demo_notifications',
    complaints: 'uenr_demo_complaints',
    settings: 'uenr_demo_settings',
    auditLogs: 'uenr_demo_audit_logs',
    students: 'uenr_demo_students'
  };

  function safeParse(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function hashValue(value) {
    if (!value) return '';
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      const charCode = value.charCodeAt(i);
      hash = (hash << 5) - hash + charCode;
      hash |= 0;
    }
    return String(hash >>> 0);
  }

  function getStorage(key, fallback) {
    return safeParse(localStorage.getItem(key), fallback);
  }

  function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getCurrentUser() {
    return getStorage(STORAGE_KEYS.currentUser, null);
  }

  function setCurrentUser(user) {
    setStorage(STORAGE_KEYS.currentUser, user);
  }

  function logoutUser() {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    window.location.href = 'login.html';
  }

  function makeDemoUsers() {
    return [
      {
        id: 'student-demo-001',
        role: 'student',
        fullName: 'Ama Boateng',
        email: 'student@uenr.edu.gh',
        studentId: 'UE2026001',
        phone: '+233245000001',
        passwordHash: hashValue('Student@123!'),
        campus: 'Sunyani Main Campus',
        school: 'School of Sciences',
        department: 'Department of Computer Science and Informatics',
        programme: 'BSc Computer Science',
        academicLevel: '300',
        academicYear: '2025/2026',
        profileImage: '',
        active: true
      },
      {
        id: 'treasurer-demo-001',
        role: 'treasurer',
        fullName: 'Joseph Kwarteng',
        email: 'treasurer@uenr.edu.gh',
        staffId: 'TR-001',
        passwordHash: hashValue('Treasurer@123!'),
        campus: 'Sunyani Main Campus',
        school: 'School of Sciences',
        department: 'Department of Computer Science and Informatics',
        active: true
      },
      {
        id: 'admin-demo-001',
        role: 'admin',
        fullName: 'Dr. Evelyn Abankwa',
        email: 'admin@uenr.edu.gh',
        staffId: 'ADM-001',
        passwordHash: hashValue('Admin@123!'),
        active: true
      }
    ];
  }

  function createDemoDues() {
    return [
      {
        id: 'dues-001',
        title: 'Departmental Dues',
        description: 'Core annual departmental contribution',
        amount: 600,
        currency: 'GHS',
        campus: 'Sunyani Main Campus',
        school: 'School of Sciences',
        department: 'Department of Computer Science and Informatics',
        programme: 'BSc Computer Science',
        academicLevel: '300',
        academicYear: '2025/2026',
        category: 'Departmental Dues',
        status: 'active',
        dueDate: '2026-10-30',
        createdAt: '2026-01-15',
        createdBy: 'treasurer@uenr.edu.gh'
      },
      {
        id: 'dues-002',
        title: 'Laboratory Dues',
        description: 'Support for laboratory and practical expenses',
        amount: 350,
        currency: 'GHS',
        campus: 'Sunyani Main Campus',
        school: 'School of Sciences',
        department: 'Department of Computer Science and Informatics',
        programme: 'BSc Computer Science',
        academicLevel: '200',
        academicYear: '2025/2026',
        category: 'Laboratory Dues',
        status: 'active',
        dueDate: '2026-11-05',
        createdAt: '2026-01-16',
        createdBy: 'treasurer@uenr.edu.gh'
      }
    ];
  }

  function createDemoPayments() {
    return [
      {
        id: 'pay-1001',
        studentId: 'UE2026001',
        studentName: 'Ama Boateng',
        email: 'student@uenr.edu.gh',
        amount: 600,
        currency: 'GHS',
        duesId: 'dues-001',
        duesTitle: 'Departmental Dues',
        paymentMethod: 'Mobile Money',
        transactionReference: 'UENR-TRX-1001',
        paymentDate: '2026-02-10',
        status: 'Successful',
        evidence: 'payment-evidence-1.jpg',
        verifiedBy: 'treasurer@uenr.edu.gh',
        verificationDate: '2026-02-11',
        campus: 'Sunyani Main Campus',
        school: 'School of Sciences',
        department: 'Department of Computer Science and Informatics',
        programme: 'BSc Computer Science',
        academicLevel: '300'
      }
    ];
  }

  function createDemoNotifications() {
    return [
      {
        id: 'note-101',
        userId: 'student-demo-001',
        title: 'Your payment is awaiting verification.',
        message: 'Your payment for Departmental Dues has been submitted and is awaiting review.',
        isRead: false,
        createdAt: new Date().toISOString(),
        type: 'payment'
      },
      {
        id: 'note-102',
        userId: 'student-demo-001',
        title: 'Receipt is now available.',
        message: 'Your verified payment receipt is ready to view and download.',
        isRead: true,
        createdAt: new Date().toISOString(),
        type: 'receipt'
      }
    ];
  }

  function createDemoComplaints() {
    return [];
  }

  function createDemoSettings() {
    return {
      appName: 'UENR Departmental Dues Management',
      demoMode: true,
      emailMode: 'Demo email integration only. Connect a secure email backend for production.',
      paymentMode: 'Demo payment workflow only. Connect a verified payment provider for production.',
      sessionTimeoutMinutes: 30,
      darkMode: false
    };
  }

  function ensureDemoData() {
    if (!getStorage(STORAGE_KEYS.users, null)) setStorage(STORAGE_KEYS.users, makeDemoUsers());
    if (!getStorage(STORAGE_KEYS.dues, null)) setStorage(STORAGE_KEYS.dues, createDemoDues());
    if (!getStorage(STORAGE_KEYS.payments, null)) setStorage(STORAGE_KEYS.payments, createDemoPayments());
    if (!getStorage(STORAGE_KEYS.notifications, null)) setStorage(STORAGE_KEYS.notifications, createDemoNotifications());
    if (!getStorage(STORAGE_KEYS.complaints, null)) setStorage(STORAGE_KEYS.complaints, createDemoComplaints());
    if (!getStorage(STORAGE_KEYS.settings, null)) setStorage(STORAGE_KEYS.settings, createDemoSettings());
    if (!getStorage(STORAGE_KEYS.auditLogs, null)) setStorage(STORAGE_KEYS.auditLogs, [{
      id: 'log-001',
      actor: 'System',
      action: 'Seeded demo data',
      timestamp: new Date().toISOString()
    }]);
    if (!getStorage(STORAGE_KEYS.students, null)) setStorage(STORAGE_KEYS.students, [
      makeDemoUsers()[0]
    ]);
  }

  window.UENRStorage = {
    STORAGE_KEYS,
    hashValue,
    getStorage,
    setStorage,
    getCurrentUser,
    setCurrentUser,
    logoutUser,
    ensureDemoData,
    getUserByEmail(email) {
      const users = getStorage(STORAGE_KEYS.users, []);
      return users.find((user) => String(user.email || '').toLowerCase() === String(email || '').toLowerCase()) || null;
    },
    getUsers() {
      return getStorage(STORAGE_KEYS.users, []);
    },
    getDues() {
      return getStorage(STORAGE_KEYS.dues, []);
    },
    getPayments() {
      return getStorage(STORAGE_KEYS.payments, []);
    },
    getNotifications() {
      return getStorage(STORAGE_KEYS.notifications, []);
    },
    getComplaints() {
      return getStorage(STORAGE_KEYS.complaints, []);
    },
    getSettings() {
      return getStorage(STORAGE_KEYS.settings, createDemoSettings());
    },
    saveUsers(users) {
      setStorage(STORAGE_KEYS.users, users);
    },
    saveDues(dues) {
      setStorage(STORAGE_KEYS.dues, dues);
    },
    savePayments(payments) {
      setStorage(STORAGE_KEYS.payments, payments);
    },
    saveNotifications(notifications) {
      setStorage(STORAGE_KEYS.notifications, notifications);
    },
    saveComplaints(complaints) {
      setStorage(STORAGE_KEYS.complaints, complaints);
    },
    saveSettings(settings) {
      setStorage(STORAGE_KEYS.settings, settings);
    },
    appendAuditLog(entry) {
      const logs = getStorage(STORAGE_KEYS.auditLogs, []);
      logs.unshift({ ...entry, id: 'log-' + Date.now(), timestamp: new Date().toISOString() });
      setStorage(STORAGE_KEYS.auditLogs, logs);
    }
  };

  ensureDemoData();
})();
