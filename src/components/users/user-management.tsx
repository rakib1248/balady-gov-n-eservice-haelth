"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, UserRoundCheck, UserRoundX, X } from "lucide-react";
import { t, type Locale } from "@/lib/locale";

type Role = "OWNER" | "ADMIN" | "STAFF" | "EDITOR" | "VIEWER";
type UserRow = { id: string; name: string; email: string; role: Role; isActive: boolean; createdAt: string; isLastActiveOwner: boolean };
type UserResult = { items: UserRow[]; page: number; pages: number; total: number };
type Editor = { id: string; name: string; email: string; role: Role; password: string };

const roleOptions: Role[] = ["OWNER", "ADMIN", "STAFF", "EDITOR", "VIEWER"];

export default function UserManagement({ locale, actorId }: { locale: Locale; actorId: string }) {
  const txt = (ar: string, en: string) => t(locale, ar, en);
  const [result, setResult] = useState<UserResult>({ items: [], page: 1, pages: 0, total: 0 });
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "STAFF" as "ADMIN" | "STAFF" });

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), pageSize: "10" });
    if (query.trim()) params.set("q", query.trim());
    if (roleFilter) params.set("role", roleFilter);
    try {
      const response = await fetch(`/api/users?${params}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "USER_LOAD_FAILED");
      setResult(payload as UserResult);
    } catch {
      setMessage(t(locale, "تعذر تحميل المستخدمين.", "Could not load users."));
    } finally {
      setLoading(false);
    }
  }, [page, query, roleFilter, locale]);

  useEffect(() => { const timer = setTimeout(() => void load(), 180); return () => clearTimeout(timer); }, [load]);

  function roleLabel(role: Role) {
    return ({ OWNER: txt("مالك", "Owner"), ADMIN: txt("مدير", "Admin"), STAFF: txt("موظف", "Staff"), EDITOR: txt("محرر", "Editor"), VIEWER: txt("مشاهد", "Viewer") })[role];
  }

  function apiError(code: string) {
    const messages: Record<string, [string, string]> = {
      EMAIL_ALREADY_EXISTS: ["البريد الإلكتروني مستخدم بالفعل.", "That email address is already in use."],
      LAST_ACTIVE_OWNER_REQUIRED: ["يجب إبقاء مالك نشط واحد على الأقل.", "At least one active owner must remain."],
      USER_HAS_HISTORY_DEACTIVATE_INSTEAD: ["لدى المستخدم سجلات مرتبطة. عطّل الحساب بدلاً من حذفه.", "This account has linked history. Deactivate it instead."],
      CANNOT_DEACTIVATE_SELF: ["لا يمكنك تعطيل حسابك الحالي.", "You cannot deactivate your own account."],
      CANNOT_DELETE_SELF: ["لا يمكنك حذف حسابك الحالي.", "You cannot delete your own account."],
      CANNOT_CHANGE_OWN_ROLE: ["لا يمكنك تغيير دور حسابك الحالي.", "You cannot change your own role."],
      USER_NOT_FOUND: ["لم يتم العثور على المستخدم.", "User not found."],
      VALIDATION_ERROR: ["تحقق من البيانات المدخلة. كلمة المرور لا تقل عن 12 حرفاً ولا تتجاوز 72 بايتاً.", "Check the entered details. Passwords must be at least 12 characters and no more than 72 UTF-8 bytes."],
    };
    const pair = messages[code] ?? ["تعذر تنفيذ العملية.", "The operation could not be completed."];
    return txt(pair[0], pair[1]);
  }

  async function send(url: string, method: string, body?: unknown) {
    setWorking(true);
    setMessage("");
    try {
      const response = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error ?? "REQUEST_FAILED");
      setMessage(txt("تم حفظ التغييرات.", "Changes saved."));
      setEditor(null);
      void load();
      return true;
    } catch (error) {
      setMessage(apiError(error instanceof Error ? error.message : "REQUEST_FAILED"));
      return false;
    } finally {
      setWorking(false);
    }
  }

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await send("/api/users", "POST", newUser)) {
      setNewUser({ name: "", email: "", password: "", role: "STAFF" });
      setCreateOpen(false);
    }
  }

  async function saveEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    const current = result.items.find((item) => item.id === editor.id);
    const body: Record<string, string> = { name: editor.name, email: editor.email };
    if (editor.password) body.password = editor.password;
    if (current && current.role !== editor.role) body.role = editor.role;
    await send(`/api/users/${encodeURIComponent(editor.id)}`, "PATCH", body);
  }

  async function toggleActive(user: UserRow) {
    await send(`/api/users/${encodeURIComponent(user.id)}`, "PATCH", { isActive: !user.isActive });
  }

  async function remove(user: UserRow) {
    const confirmed = window.confirm(txt(`هل تريد حذف حساب ${user.name}؟ لا يمكن حذف المستخدمين المرتبطين بسجلات.`, `Delete ${user.name}'s account? Users with linked records cannot be deleted.`));
    if (confirmed) await send(`/api/users/${encodeURIComponent(user.id)}`, "DELETE");
  }

  const field = (label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => <label className="user-field"><span>{label}</span><input {...props} /></label>;

  return <section className="user-management">
    <div className="user-controls">
      <label className="user-search"><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={txt("ابحث بالاسم أو البريد الإلكتروني", "Search name or email")} /></label>
      <select aria-label={txt("تصفية حسب الدور", "Filter by role")} value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setPage(1); }}>
        <option value="">{txt("كل الأدوار", "All roles")}</option>
        {roleOptions.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
      </select>
      <span className="user-total">{result.total} {txt("مستخدم", "users")}</span>
      <button type="button" className="primary-button" onClick={() => { setCreateOpen((value) => !value); setEditor(null); }}><Plus size={16} />{txt("إضافة مستخدم", "Add user")}</button>
    </div>

    {message && <div className="user-message" role="status">{message}</div>}

    {createOpen && <form className="user-editor" onSubmit={create}>
      <div className="user-editor-heading"><h2>{txt("إنشاء حساب مستخدم", "Create user account")}</h2><button type="button" aria-label={txt("إغلاق", "Close")} onClick={() => setCreateOpen(false)}><X size={17} /></button></div>
      <div className="user-form-grid">
        {field(txt("الاسم", "Name"), { required: true, maxLength: 100, value: newUser.name, onChange: (event) => setNewUser({ ...newUser, name: event.target.value }) })}
        {field(txt("البريد الإلكتروني", "Email"), { required: true, type: "email", maxLength: 254, value: newUser.email, onChange: (event) => setNewUser({ ...newUser, email: event.target.value }) })}
        {field(txt("كلمة المرور (12 حرفاً على الأقل)", "Password (12+ characters, up to 72 bytes)"), { required: true, type: "password", minLength: 12, maxLength: 128, autoComplete: "new-password", value: newUser.password, onChange: (event) => setNewUser({ ...newUser, password: event.target.value }) })}
        <label className="user-field"><span>{txt("الدور", "Role")}</span><select value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value as "ADMIN" | "STAFF" })}><option value="ADMIN">{roleLabel("ADMIN")}</option><option value="STAFF">{roleLabel("STAFF")}</option></select></label>
      </div>
      <div className="user-form-actions"><button type="submit" className="primary-button" disabled={working}><Check size={15} />{txt("إنشاء الحساب", "Create account")}</button></div>
    </form>}

    {editor && <form className="user-editor" onSubmit={saveEdit}>
      <div className="user-editor-heading"><h2>{txt("تعديل المستخدم", "Edit user")}</h2><button type="button" aria-label={txt("إغلاق", "Close")} onClick={() => setEditor(null)}><X size={17} /></button></div>
      <div className="user-form-grid">
        {field(txt("الاسم", "Name"), { required: true, maxLength: 100, value: editor.name, onChange: (event) => setEditor({ ...editor, name: event.target.value }) })}
        {field(txt("البريد الإلكتروني", "Email"), { required: true, type: "email", maxLength: 254, value: editor.email, onChange: (event) => setEditor({ ...editor, email: event.target.value }) })}
        {field(txt("كلمة مرور جديدة (12+ حرفاً، اختياري)", "New password (12+ characters, optional)"), { type: "password", minLength: 12, maxLength: 128, autoComplete: "new-password", value: editor.password, onChange: (event) => setEditor({ ...editor, password: event.target.value }) })}
        <label className="user-field"><span>{txt("الدور", "Role")}</span><select value={editor.role} disabled={editor.role === "OWNER"} onChange={(event) => setEditor({ ...editor, role: event.target.value as Role })}>{roleOptions.filter((role) => role !== "OWNER" || editor.role === "OWNER").map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}</select></label>
      </div>
      <div className="user-form-actions"><button type="submit" className="primary-button" disabled={working}><Check size={15} />{txt("حفظ التغييرات", "Save changes")}</button></div>
    </form>}

    <div className="user-table-wrap"><table className="user-table"><thead><tr><th>{txt("المستخدم", "User")}</th><th>{txt("الدور", "Role")}</th><th>{txt("الحالة", "Status")}</th><th>{txt("تاريخ الإنشاء", "Created")}</th><th>{txt("الإجراءات", "Actions")}</th></tr></thead><tbody>
      {loading ? <tr><td colSpan={5} className="user-empty">{txt("جارٍ تحميل المستخدمين…", "Loading users…")}</td></tr> : result.items.length === 0 ? <tr><td colSpan={5} className="user-empty">{txt("لا يوجد مستخدمون مطابقون.", "No matching users.")}</td></tr> : result.items.map((user) => <tr key={user.id}>
        <td><b>{user.name}{user.id === actorId && <small className="user-you">{txt("أنت", "You")}</small>}</b><small className="user-email">{user.email}</small></td>
        <td><span className={`user-role-badge role-${user.role.toLowerCase()}`}>{roleLabel(user.role)}</span></td>
        <td><span className={`user-active-badge ${user.isActive ? "is-active" : "is-inactive"}`}>{user.isActive ? txt("نشط", "Active") : txt("معطّل", "Inactive")}</span></td>
        <td dir="ltr">{new Date(user.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}</td>
        <td><div className="user-row-actions">
          <button type="button" title={txt("تعديل", "Edit")} aria-label={`${txt("تعديل", "Edit")} ${user.name}`} disabled={working} onClick={() => { setCreateOpen(false); setEditor({ id: user.id, name: user.name, email: user.email, role: user.role, password: "" }); }}><Pencil size={15} /></button>
          {user.id !== actorId && <button type="button" title={user.isActive ? txt("تعطيل", "Deactivate") : txt("إعادة التفعيل", "Reactivate")} aria-label={`${user.isActive ? txt("تعطيل", "Deactivate") : txt("إعادة التفعيل", "Reactivate")} ${user.name}`} disabled={working || (user.isActive && user.isLastActiveOwner)} onClick={() => void toggleActive(user)}>{user.isActive ? <UserRoundX size={15} /> : <UserRoundCheck size={15} />}</button>}
          {user.id !== actorId && <button type="button" className="delete-user-button" title={txt("حذف", "Delete")} aria-label={`${txt("حذف", "Delete")} ${user.name}`} disabled={working || user.isLastActiveOwner} onClick={() => void remove(user)}><Trash2 size={15} /></button>}
        </div></td>
      </tr>)}
    </tbody></table></div>
    <div className="list-pagination"><span>{txt("الصفحة", "Page")} {result.page} {txt("من", "of")} {Math.max(1, result.pages)}</span><div><button disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronRight size={15} />{txt("السابق", "Previous")}</button><button disabled={page >= result.pages || loading} onClick={() => setPage((value) => value + 1)}>{txt("التالي", "Next")}<ChevronLeft size={15} /></button></div></div>
  </section>;
}
