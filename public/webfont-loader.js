if (typeof WebFont !== "undefined" && WebFont && typeof WebFont.load === "function") {
  WebFont.load({
    google: {
      families: [
        "Open Sans:300,300italic,400,400italic,600,600italic,700,700italic,800,800italic",
        "Sora:regular,700",
        "Hahmlet:regular,700",
        "JetBrains Mono:regular",
      ],
    },
  });
}
