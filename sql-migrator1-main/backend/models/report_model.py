from datetime import datetime
from backend.extensions import db


class Report(db.Model):
    """Stores report metadata and exported file paths."""
    __tablename__ = "reports"

    id = db.Column(db.Integer, primary_key=True)
    migration_id = db.Column(db.Integer, db.ForeignKey("migrations.id"), nullable=True)
    report_format = db.Column(db.String(20), nullable=False)
    file_path = db.Column(db.String(512), nullable=True)
    summary = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "migration_id": self.migration_id,
            "report_format": self.report_format,
            "file_path": self.file_path,
            "summary": self.summary,
            "created_at": self.created_at.isoformat(),
        }
