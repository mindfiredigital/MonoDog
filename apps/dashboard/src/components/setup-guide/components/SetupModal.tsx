interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function SetupModal({
  isOpen,
  onClose,
  children,
}: SetupModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
