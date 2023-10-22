// Clear completed button
const clearButton = document.createElement('button');
clearButton.id = 'clearCompleted';
clearButton.textContent = 'Clear Completed';
clearButton.className = 'w-full p-2 bg-red-500 text-white rounded-md mt-3 hover:bg-red-600 transition ease-in-out duration-200';
clearButton.style.display = 'none'; // Hide the button by default

// Need to get the todo list container
const todoContainer = document.getElementById('todoList').parentNode;
// Add the clear completed button
todoContainer.appendChild(clearButton);

// Use chrome.storage
function getTodos() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['todos'], function(result) {
      resolve(result.todos || []);
    });
  });
}

function setTodos(todos) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({todos: todos}, function() {
      resolve();
    });
  });
}

function createTodoItem(todoText) {
  const li = document.createElement('li');
  li.className = 'p-2 border-b border-gray-200 transition-all duration-200 cursor-pointer hover:bg-gray-600 ease-in-out';
  li.draggable = true;

  // Create a item
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'mr-2 cursor-pointer'; 
  const label = document.createElement('label');
  label.className = 'flex items-center cursor-pointer'; 
  const textNode = document.createTextNode(todoText);
  label.appendChild(checkbox);
  label.appendChild(textNode);

  // Strikethrough when checked and show clear button
  checkbox.addEventListener('change', function() {
    if (this.checked) {
      li.classList.add('line-through', 'text-gray-400'); 
      clearButton.style.display = 'block';
    } else {
      li.classList.remove('line-through', 'text-gray-400');
      // Hide the clear button if no items are checked
      if (!Array.from(document.getElementById('todoList').children).some(item => item.firstChild.firstChild.checked)) {
        clearButton.style.display = 'none';
      }
    }
  });

  li.appendChild(label);

  return li;
}

document.getElementById('addTodo').addEventListener('click', async function() {
  const todoInput = document.getElementById('todoInput');
  const todoText = todoInput.value;
  
  if (todoText) {
    const li = createTodoItem(todoText);
    document.getElementById('todoList').appendChild(li);
    todoInput.value = '';

    // Save the todo
    let todos = await getTodos();
    todos.push(todoText);
    await setTodos(todos);
  }
});

window.addEventListener('load', async function() {
  let todos = await getTodos();
  todos.forEach(function(todoText) {
    const li = createTodoItem(todoText);
    document.getElementById('todoList').appendChild(li);
  });
});

// Create a todo with enter 
document.getElementById('todoInput').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('addTodo').click();
  }
});

// Clear things
document.getElementById('clearCompleted').addEventListener('click', async function() {
  const todoItems = document.getElementById('todoList').children;
  
  // Remove completed items
  for (let i = todoItems.length - 1; i >= 0; i--) {
    if (todoItems[i].firstChild.firstChild.checked) {
      // Remove the todo
      let todos = await getTodos();
      todos.splice(i, 1);
      await setTodos(todos);
  
      todoItems[i].remove();
    }
  }

  // If there are no more items, gibbeth goku 
  if (!document.getElementById('todoList').hasChildNodes()) {
    gibGoku();
  }

  // Go away button
  if (!Array.from(todoItems).some(item => item.classList.contains('line-through'))) {
    clearButton.style.display = 'none';
  }
});
  
  function gibGoku() {
    const keywords = ["goku", "super saiyan goku", "kamehameha"];
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    const GIPHY_API_KEY = "CORAf4xg925dzX7ZSSBQUjxqXboKfN8T";
    const GIPHY_API_URL = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${keyword}&limit=10&offset=0&rating=g&lang=en`;
    fetch(GIPHY_API_URL)
      .then(response => response.json())
      .then(data => {
        if (data.data.length) {
          let randomIndex = Math.floor(Math.random() * data.data.length);
          let gifUrl = data.data[randomIndex].images.original.url;
          showGifModal(gifUrl);
        }
      });
  }
  
  function showGifModal(gifUrl) {
    const gifModal = document.createElement('div');
    gifModal.id = 'gifModal';
    gifModal.style.position = 'fixed';
    gifModal.style.top = '0';
    gifModal.style.left = '0';
    gifModal.style.width = '100%';
    gifModal.style.height = '100%';
    gifModal.style.zIndex = '1000';
    gifModal.style.display = 'flex';
    gifModal.style.justifyContent = 'center';
    gifModal.style.alignItems = 'center';
    gifModal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    document.body.appendChild(gifModal);
  
    const gifImage = document.createElement('img');
    gifImage.id = 'gifImage';
    gifImage.src = gifUrl;
    gifModal.appendChild(gifImage);
  
    gifModal.style.transition = 'opacity 0.4s';
    gifModal.style.opacity = '1';
  
    setTimeout(function() {
      gifModal.style.opacity = '0';
      setTimeout(function() {
        gifModal.remove();
      }, 400);
    }, 4000);
  }

let draggedItem = null;

document.getElementById('todoList').addEventListener('dragstart', function(e) {
  draggedItem = e.target;
});

document.getElementById('todoList').addEventListener('dragover', function(e) {
  e.preventDefault();
  const closest = Array.from(e.currentTarget.children).reduce((acc, curr) => {
    const box = curr.getBoundingClientRect();
    const offset = e.clientY - box.top - box.height / 2;
    if (offset < 0 && offset > acc.offset) {
      return { offset: offset, element: curr };
    } else {
      return acc;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
  if (closest && draggedItem !== closest) {
    e.currentTarget.insertBefore(draggedItem, closest);
  }
});

document.getElementById('todoList').addEventListener('dragend', function(e) {
  draggedItem = null;
});