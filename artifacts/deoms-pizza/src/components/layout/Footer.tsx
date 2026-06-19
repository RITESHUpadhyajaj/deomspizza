export function Footer() {
  return (
    <footer className="border-t bg-card mt-12 py-12">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-2xl text-primary italic tracking-tighter mb-4">DEOMS</h3>
          <p className="text-muted-foreground text-sm">
            Hot, fresh, and unbelievably good pizza delivered right to your door in Greater Noida.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4">Links</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/menu">Menu</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}