from datetime import date
from app.models.user import User

# Test Case 1: Birthday has passed this year
u1 = User(birth_date=date(1990, 1, 1))
print(f"User 1990-01-01 Age: {u1.age} (Expected ~36)")

# Test Case 2: Birthday is tomorrow (should be 1 year less)
import datetime
tomorrow = datetime.date.today() + datetime.timedelta(days=1)
u2 = User(birth_date=date(2000, tomorrow.month, tomorrow.day))
print(f"User 2000 (birthday tomorrow) Age: {u2.age} (Expected 24 or 25 depending on year)")

# Test Case 3: No birth date
u3 = User(birth_date=None)
print(f"User No Birth Date Age: {u3.age} (Expected None)")
