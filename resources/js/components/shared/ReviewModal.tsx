import { useState } from 'react';
import { router } from '@inertiajs/react';
import { X, Star, Send } from 'lucide-react';

interface ReviewModalProps {
  type:     'store' | 'driver';
  targetId: number;
  targetName: string;
  orderId?: number;
  onClose: () => void;
}

export default function ReviewModal({ type, targetId, targetName, orderId, onClose }: ReviewModalProps) {
  const [rating,  setRating]  = useState(0);
  const [hover,   setHover]   = useState(0);
  const [comment, setComment] = useState('');
  const [saving,  setSaving]  = useState(false);

  const url = type === 'store'
    ? `/client/stores/${targetId}/reviews`
    : `/client/drivers/${targetId}/reviews`;

  const handleSubmit = () => {
    if (rating === 0) return;
    setSaving(true);
    router.post(url, { rating, comment, order_id: orderId ?? null }, {
      preserveScroll: true,
      onSuccess: () => { setSaving(false); onClose(); },
      onError:   ()   => setSaving(false),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-bold text-lg">
              {type === 'store' ? '⭐ Calificar tienda' : '⭐ Calificar domiciliario'}
            </h2>
            <p className="text-xs text-muted-foreground">{targetName}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Estrellas */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-muted-foreground">¿Cómo fue tu experiencia?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      star <= (hover || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm font-semibold text-amber-500">
                {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][rating]}
              </p>
            )}
          </div>

          {/* Comentario */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Comentario <span className="text-muted-foreground">(opcional)</span>
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Cuéntanos tu experiencia..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:ring-2 focus:ring-amber-400 transition-colors resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || rating === 0}
              className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold shadow-lg shadow-amber-400/30 hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {saving ? 'Enviando...' : 'Enviar reseña'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}