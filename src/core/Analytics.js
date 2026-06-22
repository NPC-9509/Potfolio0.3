// Analytics.js — Privacy-first local analytics tracker (Phase 14)

class LocalAnalytics {
  constructor() {
    this.stats = {
      projectViews: {},
      terminalCommands: {},
      aiQuestions: 0,
      resumeDownloads: 0,
      contactSubmissions: 0,
      scrollDepthMax: 0,
      achievementsUnlocked: 0,
      sessionStartTime: Date.now()
    };
  }

  init() {
    const saved = localStorage.getItem('mv-analytics');
    if (saved) {
      try {
        this.stats = { ...this.stats, ...JSON.parse(saved) };
      } catch(e) {}
    }
  }

  save() {
    localStorage.setItem('mv-analytics', JSON.stringify(this.stats));
  }

  trackProjectView(projectName) {
    this.stats.projectViews[projectName] = (this.stats.projectViews[projectName] || 0) + 1;
    this.save();
  }

  trackTerminalCommand(cmd) {
    const cleanCmd = cmd.trim().split(' ')[0];
    this.stats.terminalCommands[cleanCmd] = (this.stats.terminalCommands[cleanCmd] || 0) + 1;
    this.save();
  }

  trackAIQuestion() {
    this.stats.aiQuestions++;
    this.save();
  }

  trackResumeDownload() {
    this.stats.resumeDownloads++;
    this.save();
  }

  trackContactSubmission() {
    this.stats.contactSubmissions++;
    this.save();
  }

  trackScrollDepth(pct) {
    const currentMax = this.stats.scrollDepthMax || 0;
    const cleanPct = Math.round(pct * 100);
    if (cleanPct > currentMax) {
      this.stats.scrollDepthMax = cleanPct;
      this.save();
    }
  }

  trackAchievementUnlocked() {
    this.stats.achievementsUnlocked++;
    this.save();
  }

  getReport() {
    const duration = Math.round((Date.now() - this.stats.sessionStartTime) / 1000 / 60); // minutes
    return {
      uptimeMinutes: duration,
      projectViews: this.stats.projectViews,
      terminalCommands: this.stats.terminalCommands,
      aiQuestions: this.stats.aiQuestions,
      resumeDownloads: this.stats.resumeDownloads,
      contactSubmissions: this.stats.contactSubmissions,
      scrollDepthMax: this.stats.scrollDepthMax,
      achievementsUnlocked: this.stats.achievementsUnlocked
    };
  }
}

export const analytics = new LocalAnalytics();
