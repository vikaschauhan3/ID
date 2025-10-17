---
---

/* Portfolio manifest: controls order + titles for prev/next */
window.PortfolioManifest = [
  {
    title: "Client Centered Communication",
    slug: "client_centered_communication",
    href: "{{ '/client_centered_communication.html' | relative_url }}"
  },
  {
    title: "Video Based Courses",
    slug: "cmi_video_series",
    href: "{{ '/cmi_video_series.html' | relative_url }}"
  }

  // Add more in the order you want them to appear:
  // { title: "Project Name", slug: "project_slug", href: "{{ '/project_slug.html' | relative_url }}" },
];
