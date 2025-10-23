---
---

/* Portfolio manifest: controls order + titles for prev/next */
window.PortfolioManifest = [
  {
    title: "Client Centered Communication",
    slug: "client_centered_communication",
    href: "{{ '/assets/portfolio/client_centered_communication/index.html' | relative_url }}"
  },
  {
    title: "CMI Video Series",
    slug: "cmi_video_series",
    href: "{{ '/assets/portfolio/cmi_video_series/index.html' | relative_url }}"
  },
  {
    title: "Innovation Labs",
    slug: "innovation_labs",
    href: "{{ '/assets/portfolio/innovation_labs/index.html' | relative_url }}"
  },
  {
    title: "Video Based Learning",
    slug: "video_based_learning",
    href: "{{ '/assets/portfolio/video_based_learning/index.html' | relative_url }}"
  }
  // Add more in the order you want them to appear:
  // { title: "Project Name", slug: "project_slug", href: "{{ '/project_slug.html' | relative_url }}" },
];
