const supabaseUrl = 'https://ahfdcxiyyntnmcylfkqn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZmRjeGl5eW50bm1jeWxma3FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NTk2MTEsImV4cCI6MjA2MzIzNTYxMX0.bmUO6vPu8svMLE-SbuI9_Zg8XCGHrwRr9D4n-tgoaW8';

window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

main();

async function main() {
  const app = document.getElementById('app');
  while (!window.supabase) {
    await new Promise(r => setTimeout(r, 50));
  }
  const { data: { user } } = await window.supabase.auth.getUser();

  app.innerHTML = `
    <main class="min-h-screen bg-gray-50 flex flex-col items-center px-2 sm:px-4">
      <header class="w-full max-w-3xl flex flex-col sm:flex-row justify-between items-center py-6 gap-4">
        <h1 class="text-3xl font-extrabold text-gray-800">Artykuły</h1>
        <nav>
          ${user ? `
            <button id="add-article-btn" class="transition bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow mr-2 mb-2 sm:mb-0 cursor-pointer">Dodaj artykuł</button>
            <button id="logout-btn" class="transition bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded shadow cursor-pointer">Wyloguj</button>
          ` : `
            <a href="src/login/" class="transition bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">Zaloguj się</a>
          `}
        </nav>
      </header>
      <section id="articles" class="w-full max-w-3xl flex flex-col gap-6 pb-8"></section>
      <div id="modal-root"></div>
    </main>
  `;

  loadArticles(user);

  if (user) {
    document.getElementById('add-article-btn').onclick = () => showAddModal(user);
    document.getElementById('logout-btn').onclick = async () => {
      await window.supabase.auth.signOut();
      window.location.reload();
    };
  }
}

async function loadArticles(user) {
  const { data: articles, error } = await window.supabase
    .from('article')
    .select('*')
    .order('created_at', { ascending: false });

  const articlesDiv = document.getElementById('articles');
  if (error) {
    articlesDiv.innerHTML = `<div class="text-red-500">Błąd ładowania artykułów: ${error.message}</div>`;
    return;
  }
  if (!articles || articles.length === 0) {
    articlesDiv.innerHTML = `<div class="text-gray-500">Brak artykułów.</div>`;
    return;
  }

  articlesDiv.innerHTML = articles.map(article => `
    <article class="bg-white rounded-xl shadow-md p-5 flex flex-col gap-2 transition hover:shadow-lg">
      <header>
        <h2 class="text-2xl font-bold text-gray-800 break-words">${article.title}</h2>
        <h3 class="text-lg text-gray-500 font-medium break-words">${article.subtitle || ''}</h3>
      </header>
      <div class="text-sm text-gray-400">
        Autor: <span class="font-medium text-gray-700">${article.author}</span> |
        Data: ${new Date(new Date(article.created_at).getTime() + 2 * 60 * 60 * 1000).toLocaleString('pl-PL')}
      </div>
      <section class="text-gray-700 break-words whitespace-pre-line">${article.content}</section>
      ${user ? `
        <footer class="flex gap-2 mt-2">
          <button class="transition bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded shadow cursor-pointer" onclick="window.editArticle('${article.id}')">Edytuj</button>
          <button class="transition bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded shadow cursor-pointer" onclick="window.deleteArticle('${article.id}')">Usuń</button>
        </footer>
      ` : ''}
    </article>
  `).join('');
}

window.editArticle = async (id) => {
  const { data: article } = await window.supabase.from('article').select('*').eq('id', id).single();
  showEditModal(article);
};

window.deleteArticle = async (id) => {
  if (confirm('Na pewno usunąć artykuł?')) {
    await window.supabase.from('article').delete().eq('id', id);
    const { data: { user } } = await window.supabase.auth.getUser();
    loadArticles(user);
  }
};

function showEditModal(article) {
  const modalRoot = document.getElementById('modal-root');
  modalRoot.innerHTML = `
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative mx-2">
        <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl transition cursor-pointer" onclick="window.closeModal()">&times;</button>
        <h2 class="text-xl font-bold mb-4">Edytuj artykuł</h2>
        <form id="edit-article-form" class="space-y-4">
          <input type="text" name="title" class="w-full border rounded px-3 py-2" placeholder="Tytuł" value="${article.title}" required>
          <input type="text" name="subtitle" class="w-full border rounded px-3 py-2" placeholder="Podtytuł" value="${article.subtitle || ''}">
          <input type="text" name="author" class="w-full border rounded px-3 py-2" placeholder="Autor" value="${article.author}" required>
          <textarea name="content" class="w-full border rounded px-3 py-2" placeholder="Treść" required>${article.content}</textarea>
          <button type="submit" class="transition bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer">Zapisz</button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('edit-article-form').onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const updated = {
      title: form.title.value,
      subtitle: form.subtitle.value,
      author: form.author.value,
      content: form.content.value,
      created_at: new Date().toISOString()
    };
    await window.supabase.from('article').update(updated).eq('id', article.id);
    window.closeModal();
    const { data: { user } } = await window.supabase.auth.getUser();
    loadArticles(user);
  };
}

function showAddModal(user) {
  const modalRoot = document.getElementById('modal-root');
  modalRoot.innerHTML = `
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative mx-2">
        <button class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl transition cursor-pointer" onclick="window.closeModal()">&times;</button>
        <h2 class="text-xl font-bold mb-4">Dodaj artykuł</h2>
        <form id="add-article-form" class="space-y-4">
          <input type="text" name="title" class="w-full border rounded px-3 py-2" placeholder="Tytuł" required>
          <input type="text" name="subtitle" class="w-full border rounded px-3 py-2" placeholder="Podtytuł">
          <input type="text" name="author" class="w-full border rounded px-3 py-2" placeholder="Autor" required>
          <textarea name="content" class="w-full border rounded px-3 py-2" placeholder="Treść" required></textarea>
          <button type="submit" class="transition bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer">Dodaj</button>
        </form>
      </div>
    </div>
  `;
  document.getElementById('add-article-form').onsubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const newArticle = {
      title: form.title.value,
      subtitle: form.subtitle.value,
      author: form.author.value,
      content: form.content.value,
      created_at: new Date().toISOString()
    };
    await window.supabase.from('article').insert([newArticle]);
    window.closeModal();
    const { data: { user } } = await window.supabase.auth.getUser();
    loadArticles(user);
  };
}

window.closeModal = () => {
  document.getElementById('modal-root').innerHTML = '';
};