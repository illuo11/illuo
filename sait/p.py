import random


def pick_winners(entries, n=1):
winners = random.sample(entries, min(n, len(entries)))
return winners


if __name__ == '__main__':
sample_entries = ['nick1', 'nick2', 'nick3']
print(pick_winners(sample_entries, 2))
# app.py
import importlib.util

spec = importlib.util.spec_from_file_location("my_module", "p.pyt")
pyt_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pyt_module)

entries = ['nick1','nick2','nick3']
winner = pyt_module.pick_winners(entries, 1)
print(winner)
