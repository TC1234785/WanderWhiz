from faker import Faker
import random
from .members.models import Business

def generate_mock_data(num_entries):
    fake = Faker()

    # Create mock businesses
    for i in range(num_entries):
        business = Business(
            business_name=fake.company(),
            business_type=random.choice([Business.LODGING, Business.RESTAURANTS, Business.TOURIST_ATTRACTIONS]),
            pricerange=random.randint(1, 5),
            country=fake.country(),
            city=fake.city(),
            address=fake.address()
        )
        business.save()

        print(f"Mock business created: {business.business_name}")

# Usage: Call the function with the desired number of mock data entries
generate_mock_data(10)