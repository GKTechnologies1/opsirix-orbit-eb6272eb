import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";

type Props = {
  label: string;
  title: string;
  subtitle: string;
  pageName: string;
};

export function PageHeader({ label, title, subtitle, pageName }: Props) {
  return (
    <header className="page-header">
      <div className="bg-grid" aria-hidden />
      <div className="page-header-glow" aria-hidden />
      <div className="page-header-inner">
        <motion.nav
          className="page-crumb"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Link to="/" className="page-crumb-link">Home</Link>
          <span className="page-crumb-sep">→</span>
          <span className="page-crumb-current">{pageName}</span>
        </motion.nav>

        <motion.span
          className="label-pill page-header-pill"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05, ease: "easeOut" }}
        >
          {label}
        </motion.span>

        <motion.h1
          className="page-header-h1"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          {title}
        </motion.h1>

        <motion.p
          className="page-header-sub"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: "easeOut" }}
        >
          {subtitle}
        </motion.p>
      </div>
    </header>
  );
}

export default PageHeader;
