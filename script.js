/* State Management */
const appState = {
    schools: JSON.parse(localStorage.getItem('schools')) || [
        { id: 's1', name: 'مدرسة المستقبل الأهلية', address: 'الرياض - حي النخيل', type: 'بنين' },
        { id: 's2', name: 'الثانوية الأولى', address: 'جدة - حي الشاطئ', type: 'بنات' }
    ],
    employees: JSON.parse(localStorage.getItem('employees')) || [
        { id: 'e1', name: 'أحمد صالح', role: 'مدير المدرسة', schoolId: 's1' },
        { id: 'e2', name: 'سارة محمد', role: 'معلمة فيزياء', schoolId: 's2' }
    ],
    students: JSON.parse(localStorage.getItem('students')) || [
        { id: 'st1', name: 'عمر خالد', grade: 'المرحلة الثانوية', schoolId: 's1' },
        { id: 'st2', name: 'نورة عبدالله', grade: 'المرحلة الثانوية', schoolId: 's2' }
    ]
};

/* Initialization */
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    renderSchools();
    renderEmployees();
    renderStudents();
});

/* Helpers */
function saveState() {
    localStorage.setItem('schools', JSON.stringify(appState.schools));
    localStorage.setItem('employees', JSON.stringify(appState.employees));
    localStorage.setItem('students', JSON.stringify(appState.students));
    updateDashboard();
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function getSchoolName(id) {
    const school = appState.schools.find(s => s.id === id);
    return school ? school.name : '<span class="text-red-400">غير محدد</span>';
}

/* Navigation Logic */
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('main section').forEach(sec => sec.classList.add('hidden'));
    document.querySelectorAll('main section').forEach(sec => sec.classList.remove('block'));
    
    // Show target section
    const target = document.getElementById(`${sectionId}-section`);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('block');
    }

    // Update Sidebar Active State
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.dataset.target === sectionId) {
            btn.classList.add('bg-slate-800', 'text-indigo-400');
            btn.classList.remove('text-white');
        } else {
            btn.classList.remove('bg-slate-800', 'text-indigo-400');
            btn.classList.add('text-white');
        }
    });

    // Update Header Title
    const titles = {
        'dashboard': 'لوحة التحكم',
        'schools': 'إدارة المدارس',
        'employees': 'الموظفين والمعلمين',
        'students': 'الطلاب'
    };
    document.getElementById('page-title').textContent = titles[sectionId] || 'لوحة التحكم';
}

function toggleMobileMenu() {
    const sidebar = document.getElementById('mobile-sidebar');
    const backdrop = document.getElementById('mobile-backdrop');
    
    if (sidebar.classList.contains('translate-x-full')) {
        sidebar.classList.remove('translate-x-full');
        backdrop.classList.remove('hidden');
    } else {
        sidebar.classList.add('translate-x-full');
        backdrop.classList.add('hidden');
    }
}

/* Modal Logic */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('hidden');
    
    // If opening a modal that needs school options, populate them
    if (modalId === 'employee-modal' || modalId === 'student-modal') {
        populateSchoolSelects();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    // Reset form inside the modal
    const form = document.querySelector(`#${modalId} form`);
    if (form) form.reset();
}

function populateSchoolSelects() {
    const options = appState.schools.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    const defaultOption = '<option value="">اختر المدرسة...</option>';
    
    const empSelect = document.getElementById('employee-school-select');
    if (empSelect) empSelect.innerHTML = defaultOption + options;

    const stuSelect = document.getElementById('student-school-select');
    if (stuSelect) stuSelect.innerHTML = defaultOption + options;
}

/* CRUD Operations */

// --- Schools ---
function renderSchools() {
    const tbody = document.getElementById('schools-list');
    const msg = document.getElementById('no-schools-msg');
    
    tbody.innerHTML = '';
    
    if (appState.schools.length === 0) {
        msg.classList.remove('hidden');
        return;
    }
    msg.classList.add('hidden');

    appState.schools.forEach(school => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition-colors';
        tr.innerHTML = `
            <td class="p-4 font-semibold text-gray-800">${school.name}</td>
            <td class="p-4 text-gray-600">${school.address}</td>
            <td class="p-4"><span class="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full text-xs">${school.type}</span></td>
            <td class="p-4">
                <button onclick="deleteSchool('${school.id}')" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded transition-colors">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('school-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSchool = {
        id: generateId(),
        name: formData.get('name'),
        address: formData.get('address'),
        type: formData.get('type')
    };
    
    appState.schools.push(newSchool);
    saveState();
    renderSchools();
    closeModal('school-modal');
});

function deleteSchool(id) {
    if(confirm('هل أنت متأكد من حذف هذه المدرسة؟ سيؤثر هذا على الطلاب والموظفين المرتبطين بها.')) {
        appState.schools = appState.schools.filter(s => s.id !== id);
        // Optional: Remove linked students/employees or keep them orphan
        // For simplicity, we keep them but they will show "Unknown School"
        saveState();
        renderSchools();
        renderEmployees(); // Refresh to update school names if needed
        renderStudents();
    }
}

// --- Employees ---
function renderEmployees() {
    const tbody = document.getElementById('employees-list');
    const msg = document.getElementById('no-employees-msg');
    
    tbody.innerHTML = '';
    
    if (appState.employees.length === 0) {
        msg.classList.remove('hidden');
        return;
    }
    msg.classList.add('hidden');

    appState.employees.forEach(emp => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition-colors';
        tr.innerHTML = `
            <td class="p-4 font-semibold text-gray-800">${emp.name}</td>
            <td class="p-4 text-gray-600">${emp.role}</td>
            <td class="p-4 text-indigo-600">${getSchoolName(emp.schoolId)}</td>
            <td class="p-4">
                <button onclick="deleteEmployee('${emp.id}')" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded transition-colors">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('employee-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newEmp = {
        id: generateId(),
        name: formData.get('name'),
        role: formData.get('role'),
        schoolId: formData.get('schoolId')
    };
    
    appState.employees.push(newEmp);
    saveState();
    renderEmployees();
    closeModal('employee-modal');
});

function deleteEmployee(id) {
    if(confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
        appState.employees = appState.employees.filter(e => e.id !== id);
        saveState();
        renderEmployees();
    }
}

// --- Students ---
function renderStudents() {
    const tbody = document.getElementById('students-list');
    const msg = document.getElementById('no-students-msg');
    
    tbody.innerHTML = '';
    
    if (appState.students.length === 0) {
        msg.classList.remove('hidden');
        return;
    }
    msg.classList.add('hidden');

    appState.students.forEach(student => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50 transition-colors';
        tr.innerHTML = `
            <td class="p-4 font-semibold text-gray-800">${student.name}</td>
            <td class="p-4 text-gray-600">${student.grade}</td>
            <td class="p-4 text-indigo-600">${getSchoolName(student.schoolId)}</td>
            <td class="p-4">
                <button onclick="deleteStudent('${student.id}')" class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded transition-colors">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('student-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newStudent = {
        id: generateId(),
        name: formData.get('name'),
        grade: formData.get('grade'),
        schoolId: formData.get('schoolId')
    };
    
    appState.students.push(newStudent);
    saveState();
    renderStudents();
    closeModal('student-modal');
});

function deleteStudent(id) {
    if(confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
        appState.students = appState.students.filter(s => s.id !== id);
        saveState();
        renderStudents();
    }
}

// --- Dashboard Stats ---
function updateDashboard() {
    document.getElementById('stat-schools').textContent = appState.schools.length;
    document.getElementById('stat-employees').textContent = appState.employees.length;
    document.getElementById('stat-students').textContent = appState.students.length;
}