"use client";

import { useActionState, useState } from "react";
import {
  deleteUserAction,
  setUserBlockedAction,
  setUserRoleAction,
  type UserActionState,
} from "./actions";

interface UserActionsProps {
  id: string;
  name: string;
  isAdmin: boolean;
  blocked: boolean;
  /** Why this row can't be changed (self, super admin, fellow admin); hides the buttons */
  lockedReason?: string;
}

const pill = "rounded-full px-3 py-1.5 text-sm font-semibold disabled:opacity-50";

export function UserActions({ id, name, isAdmin, blocked, lockedReason }: UserActionsProps) {
  const [roleState, roleAction, rolePending] = useActionState<UserActionState, FormData>(setUserRoleAction, null);
  const [blockState, blockAction, blockPending] = useActionState<UserActionState, FormData>(setUserBlockedAction, null);
  const [deleteState, deleteAction, deletePending] = useActionState<UserActionState, FormData>(deleteUserAction, null);
  const [confirming, setConfirming] = useState(false);

  if (lockedReason) return <p className="text-sm text-pencil">{lockedReason}</p>;

  const message = [deleteState, blockState, roleState].find(Boolean);

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <form action={roleAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="role" value={isAdmin ? "user" : "admin"} />
          <button disabled={rolePending} className={`${pill} bg-raised hover:bg-rule`}>
            {isAdmin ? "Cabut admin" : "Jadikan admin"}
          </button>
        </form>

        <form action={blockAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="blocked" value={blocked ? "0" : "1"} />
          <button
            disabled={blockPending}
            className={`${pill} ${blocked ? "bg-pen-soft text-pen hover:opacity-90" : "bg-raised hover:bg-rule"}`}
          >
            {blocked ? "Buka blokir" : "Blokir"}
          </button>
        </form>

        {confirming ? (
          <form action={deleteAction} className="flex gap-2">
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="confirm" value={id} />
            <button
              disabled={deletePending}
              className={`${pill} bg-red-600 text-white hover:bg-red-500`}
              aria-label={`Hapus permanen akun ${name}`}
            >
              {deletePending ? "Menghapus…" : "Hapus permanen"}
            </button>
            <button type="button" onClick={() => setConfirming(false)} className={`${pill} bg-raised hover:bg-rule`}>
              Batal
            </button>
          </form>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className={`${pill} text-red-300 hover:bg-red-950/60`}>
            Hapus
          </button>
        )}
      </div>

      {confirming && !deleteState && (
        <p className="max-w-xs text-xs text-red-200 sm:text-right">
          Akun, progres, aktivitas harian, dan request {name} akan hilang permanen.
        </p>
      )}
      {message && (
        <p role="status" className={`text-sm ${message.ok ? "text-pen" : "text-red-200"}`}>
          {message.message}
        </p>
      )}
    </div>
  );
}
