import { FaTelegram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full py-4 text-center font-jetbrains-mono">
      <a
        href="https://t.me/sergiobulaev"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 transition-colors"
      >
        Подпишитесь на мой канал про AI
      </a>
      <p className="mt-2 text-sm text-gray-600">
        © Sergey Bulaev 2024
      </p>
    </footer>
  );
}