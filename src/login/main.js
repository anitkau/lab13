const supabaseUrl = 'https://ahfdcxiyyntnmcylfkqn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZmRjeGl5eW50bm1jeWxma3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NTk2MTEsImV4cCI6MjA2MzIzNTYxMX0.bmUO6vPu8svMLE-SbuI9_Zg8XCGHrwRr9D4n-tgoaW8';

window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

main();

function main() {
  const app = document.getElementById('app');
  app.innerHTML += `
    <main class="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-2">
      <section class="w-full max-w-sm">
        <form id="login-form" class="bg-white p-6 rounded-xl shadow-md w-full space-y-4">
          <h2 class="text-2xl font-bold mb-2 text-center text-gray-800">Logowanie</h2>
          <input type="email" name="email" placeholder="Email" required class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
          <input type="password" name="password" placeholder="Hasło" required class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded shadow cursor-pointer">Zaloguj się</button>
          <div id="login-error" class="text-red-500 text-center"></div>
        </form>
      </section>
    </main>
  `;

  document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;
    const { error } = await window.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      document.getElementById('login-error').textContent = error.message;
    } else {
      window.location.href = '../../';
    }
  };
}
