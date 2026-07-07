import { useCallback, useEffect, useState, type FormEvent } from "react";
import "./App.css";

const API_URL = "https://todo-f83m.onrender.com/api";

type User = {
  id: string;
  username: string;
};

type Task = {
  _id: string;
  title: string;
  completed: boolean;
};

type AuthMode = "signin" | "signup";

type AuthResponse = {
  token: string;
  user: User;
  message?: string;
};

type ErrorResponse = {
  message?: string;
};

async function readError(response: Response) {
  const data = (await response.json()) as ErrorResponse;
  return data.message || "Something went wrong";
}

function App() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? (JSON.parse(savedUser) as User) : null;
  });
  const [todoText, setTodoText] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!username.trim() || !password.trim()) {
      setMessage("Please enter username and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        setMessage(await readError(response));
        return;
      }

      const data = (await response.json()) as AuthResponse;

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setUsername("");
      setPassword("");
    } catch {
      setMessage("Could not connect to backend. Is the server running?");
    } finally {
      setLoading(false);
    }
  }

  const loadTasks = useCallback(async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) {
        setMessage(await readError(response));
        return;
      }

      const data = (await response.json()) as Task[];
      setTasks(data);
    } catch {
      setMessage("Could not load tasks. Is the server running?");
    }
  }, []);

  useEffect(() => {
    if (token) {
      const timeoutId = window.setTimeout(() => {
        loadTasks(token);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [token, loadTasks]);

  async function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (todoText.trim() === "") {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: todoText }),
      });

      if (!response.ok) {
        setMessage(await readError(response));
        return;
      }

      const newTask = (await response.json()) as Task;
      setTasks([newTask, ...tasks]);
      setTodoText("");
    } catch {
      setMessage("Could not add task.");
    }
  }

  async function toggleTask(task: Task) {
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/tasks/${task._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!response.ok) {
        setMessage(await readError(response));
        return;
      }

      const updatedTask = (await response.json()) as Task;

      setTasks(
        tasks.map((currentTask) =>
          currentTask._id === updatedTask._id ? updatedTask : currentTask
        )
      );
    } catch {
      setMessage("Could not update task.");
    }
  }

  async function deleteTask(id: string) {
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setMessage(await readError(response));
        return;
      }

      setTasks(tasks.filter((task) => task._id !== id));
    } catch {
      setMessage("Could not delete task.");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setTasks([]);
    setTodoText("");
    setMessage("");
  }

  if (!user || !token) {
    return (
      <main className="app">
        <section className="auth-box">
          <h1>{mode === "signin" ? "Sign In" : "Sign Up"}</h1>

          <form className="auth-form" onSubmit={handleAuth}>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
            />
            <button type="submit" disabled={loading}>
              {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
            </button>
          </form>

          {message && <p className="message">{message}</p>}

          <button
            type="button"
            className="switch-button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setMessage("");
            }}
          >
            {mode === "signin"
              ? "Need an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <section className="todo-box">
        <div className="top-bar">
          <div>
            <h1>My To-Do App</h1>
            <p>Signed in as {user.username}</p>
          </div>

          <button type="button" onClick={logout}>
            Logout
          </button>
        </div>

        <form className="todo-form" onSubmit={addTask}>
          <input
            value={todoText}
            onChange={(event) => setTodoText(event.target.value)}
            placeholder="Write a task..."
          />
          <button type="submit">Add</button>
        </form>

        {message && <p className="message">{message}</p>}

        {tasks.length === 0 ? (
          <p className="empty-message">No tasks yet. Add your first one.</p>
        ) : (
          <ul className="todo-list">
            {tasks.map((task) => (
              <li key={task._id} className="todo-item">
                <label>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task)}
                  />
                  <span className={task.completed ? "completed" : ""}>
                    {task.title}
                  </span>
                </label>

                <button type="button" onClick={() => deleteTask(task._id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;
