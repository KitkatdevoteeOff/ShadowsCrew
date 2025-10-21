document.addEventListener('DOMContentLoaded', () => {
    // Éléments d'interface
    const authSection = document.getElementById('auth-section');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const codeSection = document.getElementById('code-section');
    const codeForm = document.getElementById('code-form');
    const messageElement = document.getElementById('message');
    const usernameSpan = document.getElementById('username');
    
    // Liens pour basculer entre les formulaires
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        messageElement.textContent = '';
    });

    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        messageElement.textContent = '';
    });
    
    // Fonction d'affichage des messages
    function showMessage(text, type) { /* ... (Fonction inchangée) ... */ }
    
    // Fonction pour mettre à jour l'interface après connexion/déconnexion
    function updateUI(isLoggedIn, pseudo = null) {
        if (isLoggedIn) {
            authSection.classList.add('hidden');
            codeSection.classList.remove('hidden');
            usernameSpan.textContent = pseudo;
            showMessage('Bienvenue ! Entrez votre code.', 'info');
        } else {
            authSection.classList.remove('hidden');
            codeSection.classList.add('hidden');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            showMessage('Veuillez vous connecter ou créer un compte.', 'info');
        }
    }

    // Vérifie le statut initial (en demandant au serveur)
    async function checkLoginStatus() {
        // MAQUETTE : En l'absence de vérification côté client, on assume qu'il faut se connecter
        // Dans une application réelle, on ferait un GET /api/status pour vérifier la session.
        updateUI(false); 
    }
    checkLoginStatus(); 

    // Gestion de l'enregistrement
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('reg-email').value;
        const pseudo = document.getElementById('reg-pseudo').value;
        const password = document.getElementById('reg-password').value;
        
        // Appel POST vers /api/register
        // ... (Implémentation du fetch) ...
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, pseudo, password })
        });
        const result = await response.json();
        
        if (result.success) {
            updateUI(true, result.pseudo);
            showMessage(result.message, 'success');
        } else {
            showMessage(result.message, 'error');
        }
    });

    // Gestion de la connexion
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Appel POST vers /api/login
        // ... (Implémentation du fetch) ...
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();
        
        if (result.success) {
            updateUI(true, result.pseudo);
            showMessage(result.message, 'success');
        } else {
            showMessage(result.message, 'error');
        }
    });
    
    // Gestion de la déconnexion
    document.getElementById('logout-link').addEventListener('click', async (e) => {
        e.preventDefault();
        await fetch('/api/logout');
        updateUI(false);
        showMessage('Vous êtes déconnecté.', 'info');
    });

    // Gestion de la soumission du code (inchangée, mais utilise la session du serveur)
    // ... (Code de codeForm.addEventListener inchangé par rapport à la réponse précédente) ...
});
