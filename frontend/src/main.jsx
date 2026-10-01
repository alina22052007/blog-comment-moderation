import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { api } from './api';
import './styles.css';

const savedUser = JSON.parse(localStorage.getItem('user') || 'null');

function App() {
  const [user, setUser] = useState(savedUser);
  const [page, setPage] = useState('home');
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');

  async function loadPosts() { try { setPosts(await api('/posts')); } catch (e) { setMessage(e.message); } }
  useEffect(() => { loadPosts(); }, []);

  function login(data) { localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); setUser(data.user); setPage('home'); }
  function logout() { localStorage.clear(); setUser(null); setPage('home'); }

  return <div className="app">
    <header><div className="brand">The Commons</div><nav>
      <button onClick={() => { setPage('home'); loadPosts(); }}>Home</button>
      {user?.role === 'author' && <button onClick={() => setPage('create')}>Write a post</button>}
      {user?.role === 'moderator' && <button onClick={() => setPage('moderate')}>Moderation</button>}
      {user ? <button onClick={logout}>Log out</button> : <><button onClick={() => setPage('login')}>Log in</button><button className="primary" onClick={() => setPage('register')}>Create account</button></>}
    </nav></header>
    {message && <div className="toast">{message}<button onClick={() => setMessage('')}>×</button></div>}
    <main>
      {page === 'home' && <Home posts={posts} onOpen={(p) => { setSelected(p); setPage('post'); }} />}
      {page === 'post' && selected && <PostPage post={selected} user={user} onBack={() => setPage('home')} />}
      {page === 'login' && <Auth mode="login" onSuccess={login} onSwitch={() => setPage('register')} />}
      {page === 'register' && <Auth mode="register" onSuccess={login} onSwitch={() => setPage('login')} />}
      {page === 'create' && <CreatePost onDone={(p) => { setPosts([p, ...posts]); setSelected(p); setPage('post'); }} />}
      {page === 'moderate' && <Moderation />}
    </main>
  </div>;
}

function Home({ posts, onOpen }) { return <section><div className="hero"><p className="eyebrow">BLOG COMMENT MODERATION SYSTEM</p><h1>Ideas worth reading.<br/>Conversations worth moderating.</h1><p>Publish thoughtful posts and keep discussions healthy with simple role-based moderation.</p></div><h2>Latest posts</h2><div className="grid">{posts.length ? posts.map(p => <article className="card" key={p._id} onClick={() => onOpen(p)}><h3>{p.title}</h3><p>{p.content.slice(0,180)}{p.content.length>180?'…':''}</p><small>By {p.author?.name || 'Author'} · {new Date(p.createdAt).toLocaleDateString()}</small></article>) : <div className="empty">No posts yet.</div>}</div></section>; }

function Auth({ mode, onSuccess, onSwitch }) {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'reader' }); const [error,setError]=useState('');
  async function submit(e){e.preventDefault();setError('');try{const data=await api(`/auth/${mode==='login'?'login':'register'}`,{method:'POST',body: mode==='login'?{email:form.email,password:form.password}:form});onSuccess(data);}catch(err){setError(err.message);}}
  return <section className="form-page"><form className="panel" onSubmit={submit}><h1>{mode==='login'?'Log in':'Create an account'}</h1>{mode==='register'&&<input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>}<input type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/><input type="password" placeholder="Password (6+ characters)" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>{mode==='register'&&<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="reader">Reader</option><option value="author">Author</option><option value="moderator">Moderator</option></select>}{error&&<p className="error">{error}</p>}<button className="primary wide">{mode==='login'?'Log in':'Create account'}</button><button type="button" className="link" onClick={onSwitch}>{mode==='login'?'Create an account':'I already have an account'}</button></form></section>
}

function CreatePost({onDone}){const [title,setTitle]=useState('');const [content,setContent]=useState('');const [error,setError]=useState('');async function submit(e){e.preventDefault();try{const p=await api('/posts',{method:'POST',body:{title,content}});onDone(p);}catch(e){setError(e.message);}}return <section className="form-page"><form className="panel widepanel" onSubmit={submit}><h1>Write a post</h1><input placeholder="Post title" value={title} onChange={e=>setTitle(e.target.value)} required/><textarea placeholder="Write your post..." value={content} onChange={e=>setContent(e.target.value)} rows="12" required/>{error&&<p className="error">{error}</p>}<button className="primary">Publish post</button></form></section>}

function PostPage({post,user,onBack}){const [comments,setComments]=useState([]);const [text,setText]=useState('');const [error,setError]=useState('');const owner=user?.id===post.author?._id;async function load(){try{setComments(await api(`/posts/${post._id}/comments${owner?'?status=pending':''}`));}catch(e){setError(e.message);}}useEffect(()=>{load();},[post._id,user?.id]);async function submit(e){e.preventDefault();try{await api(`/posts/${post._id}/comments`,{method:'POST',body:{content:text}});setText('');setError('Comment submitted for moderation.');}catch(e){setError(e.message);}}return <section><button className="back" onClick={onBack}>← Back</button><article className="post"><h1>{post.title}</h1><small>By {post.author?.name || 'Author'}</small><div className="content">{post.content.split('\n').map((x,i)=><p key={i}>{x}</p>)}</div></article><section className="comments"><h2>{owner?'All comments on your post':'Comments'}</h2>{error&&<p className="error">{error}</p>}<div>{comments.map(c=><div className="comment" key={c._id}><strong>{c.author?.name||'Reader'}</strong><span className={`status ${c.status}`}>{c.status}</span><p>{c.content}</p></div>)}{!comments.length&&<p>No comments yet.</p>}</div>{user&&<form onSubmit={submit} className="comment-form"><h2>Add a comment</h2><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Write your comment..." maxLength="1000" required/><button className="primary">Post comment</button></form>}{!user&&<p>Log in to comment.</p>}</section></section>}

function Moderation(){const [comments,setComments]=useState([]);const [error,setError]=useState('');async function load(){try{setComments(await api('/comments/pending'));}catch(e){setError(e.message);}}useEffect(()=>{load();},[]);async function action(id,status){try{await api(`/comments/${id}/${status}`,{method:'PATCH'});setComments(comments.filter(c=>c._id!==id));}catch(e){setError(e.message);}}return <section><h1>Moderation queue</h1>{error&&<p className="error">{error}</p>}{comments.length?comments.map(c=><div className="moderation" key={c._id}><div><small>Post: {c.post?.title}</small><h3>{c.author?.name}</h3><p>{c.content}</p></div><div><button className="primary" onClick={()=>action(c._id,'approve')}>Approve</button><button className="danger" onClick={()=>action(c._id,'reject')}>Reject</button></div></div>):<div className="empty">No pending comments.</div>}</section>}

createRoot(document.getElementById('root')).render(<App/>);
